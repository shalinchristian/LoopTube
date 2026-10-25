// Volume boost through Web Audio. The pipeline is only built once the user goes above 100%,
// so normal playback never passes through an AudioContext.
let activePipeline = null;

function buildPipeline(vid) {
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    const ctx = new AudioContextClass();
    const source = ctx.createMediaElementSource(vid);
    const compressor = ctx.createDynamicsCompressor();
    const gainNode = ctx.createGain();

    source.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(ctx.destination);

    return { ctx, source, compressor, gainNode, video: vid };
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
        // Limiter keeps boosted peaks from clipping.
        p.compressor.threshold.value = -1;
        p.compressor.ratio.value = 20;
        p.compressor.knee.value = 0;
        p.compressor.attack.value = 0.001;
        p.compressor.release.value = 0.1;
    } else {
        p.gainNode.gain.value = 1;
        p.compressor.threshold.value = 0;
        p.compressor.ratio.value = 1;
    }

    if (p.ctx.state === 'suspended') {
        p.ctx.resume().catch(() => {});
    }
}
