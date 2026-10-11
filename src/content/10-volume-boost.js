// Low-distortion Web Audio Engine
function applyVolumeBoost() {
    // Volume boost works on its own, even when the loop button is disabled.
    
    const vid = getVideo();
    if (!vid) return;

    // Build the audio processing graph if it doesn't exist for this specific video element
    if (!vid._audioPipeline) {
        try {
            const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
            const ctx = new AudioContextClass();
            const source = ctx.createMediaElementSource(vid);
            const compressor = ctx.createDynamicsCompressor();
            const gainNode = ctx.createGain();

            source.connect(compressor);
            compressor.connect(gainNode);
            gainNode.connect(ctx.destination);

            vid._audioPipeline = { ctx, source, compressor, gainNode };
        } catch (e) {
            console.error("LoopTube: Volume boost node pipeline failed:", e);
            return;
        }
    }

    const pipeline = vid._audioPipeline;
    if (pipeline) {
        const multiplier = state.volumeLevel / 100;

        if (multiplier > 1.0) {
            pipeline.gainNode.gain.value = multiplier; 
            // Keep the brickwall limiter active to catch peaks at any boosted volume
            pipeline.compressor.threshold.value = -1;
            pipeline.compressor.ratio.value = 20;
            pipeline.compressor.knee.value = 0;
            pipeline.compressor.attack.value = 0.001;
            pipeline.compressor.release.value = 0.1;
        } else {
            pipeline.gainNode.gain.value = 1.0; 
            pipeline.compressor.threshold.value = 0; 
            pipeline.compressor.ratio.value = 1; 
        }

        if (pipeline.ctx.state === 'suspended') {
            pipeline.ctx.resume().catch(() => {});
        }
    }
}

