// Volume boost through Web Audio. The pipeline is only built once the user goes above 100%,
// so normal playback never passes through an AudioContext.
let activePipeline = null;

// Soft ceiling after the limiter. It is linear up to 0.85 and then rounds off towards 0.99, so
// whatever the compressor lets through never goes past full scale and never hard-clips. The
// shaper's input is halved first, so the curve covers peaks up to twice full scale.
const CEILING_RANGE = 2;
let ceilingCurve = null;
function getCeilingCurve() {
    if (ceilingCurve) return ceilingCurve;
    const n = 8193, knee = 0.85, top = 0.99;
    ceilingCurve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        const x = (i / (n - 1) * 2 - 1) * CEILING_RANGE, a = Math.abs(x);
        const y = a <= knee ? a : knee + (top - knee) * Math.tanh((a - knee) / (top - knee));
        ceilingCurve[i] = Math.sign(x) * y;
    }
    return ceilingCurve;
}

function buildPipeline(vid) {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    const ctx = new AudioContextClass();
    const source = ctx.createMediaElementSource(vid);
    const gainNode = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    const ceilingIn = ctx.createGain();
    const ceiling = ctx.createWaveShaper();
    ceiling.oversample = '2x';

    // Gain first, then the limiter and the soft ceiling, so boosted peaks are caught before they clip.
    source.connect(gainNode);
    gainNode.connect(compressor);
    compressor.connect(ceilingIn);
    ceilingIn.connect(ceiling);
    ceiling.connect(ctx.destination);

    return { ctx, source, compressor, gainNode, ceilingIn, ceiling, video: vid };
}

function closeStalePipeline(vid) {
    // YouTube sometimes swaps the <video> element; free the old context instead of leaking it.
    if (activePipeline && activePipeline.video !== vid && !activePipeline.video.isConnected) {
        activePipeline.ctx.close().catch(() => {});
        activePipeline = null;
    }
}

function applyVolumeBoost() {
    const vid = getVideo();
    if (!vid) return;

    closeStalePipeline(vid);

    const multiplier = state.volumeLevel / 100;

    // A media element can only be routed into Web Audio once, so an existing pipeline is kept
    // and simply set back to neutral when the boost is turned down.
    if (!vid._audioPipeline) {
        if (multiplier <= 1) return;
        try {
            vid._audioPipeline = buildPipeline(vid);
            activePipeline = vid._audioPipeline;
        } catch (e) {
            console.error('LoopTube: volume boost failed to start:', e);
            return;
        }
    }

    const p = vid._audioPipeline;

    if (multiplier > 1) {
        p.gainNode.gain.value = multiplier;
        // Tuned with offline renders of loud material (a 0.9 sine and dense music): 150/200/350%
        // come out 1.6-2.0 dB (sine) and 2.6-4.8 dB (music) louder than 100%, with no sample
        // above 0.99. The compressor's own make-up gain does part of the lifting.
        p.compressor.threshold.value = -1;
        p.compressor.knee.value = 6;
        p.compressor.ratio.value = 12;
        p.compressor.attack.value = 0.003;
        p.compressor.release.value = 0.1;
        p.ceilingIn.gain.value = 1 / CEILING_RANGE;
        p.ceiling.curve = getCeilingCurve();
    } else {
        // At 100% the chain is neutral: unity gain, a compressor that does nothing and no ceiling.
        p.gainNode.gain.value = 1;
        p.compressor.threshold.value = 0;
        p.compressor.ratio.value = 1;
        p.compressor.knee.value = 0;
        p.ceilingIn.gain.value = 1;
        p.ceiling.curve = null;
    }

    if (p.ctx.state === 'suspended') {
        p.ctx.resume().catch(() => {});
    }
}
