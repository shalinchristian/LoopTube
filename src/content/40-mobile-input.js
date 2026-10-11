function stopEvent(e, shouldPrevent) {
    if (shouldPrevent && e.cancelable) e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
    }
}

function getEventPoint(e) {
    const touch = e.changedTouches && e.changedTouches[0];
    if (touch) return { x: touch.clientX, y: touch.clientY };

    if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
        return { x: e.clientX, y: e.clientY };
    }

    return null;
}

function mobileEventHitsButton(e) {
    if (!isMobile) return false;

    const btn = getButton();
    if (!btn || !btn.isConnected) return false;

    const style = getComputedStyle(btn);
    if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.pointerEvents === 'none' ||
        style.opacity === '0'
    ) {
        return false;
    }

    if (e.target === btn || btn.contains(e.target)) return true;

    const point = getEventPoint(e);
    if (!point) return false;

    const rect = btn.getBoundingClientRect();
    const hitSlop = 8;

    return (
        point.x >= rect.left - hitSlop &&
        point.x <= rect.right + hitSlop &&
        point.y >= rect.top - hitSlop &&
        point.y <= rect.bottom + hitSlop
    );
}

function absorbMobileButtonEvent(e) {
    if (!mobileEventHitsButton(e)) return;
    stopEvent(e, true);
}

function activateMobileButton(e) {
    if (!mobileEventHitsButton(e)) return;

    stopEvent(e, true);

    const now = performance.now();
    if (now - state.lastMobileActivation < MOBILE_ACTIVATION_DEDUPE_MS) return;

    state.lastMobileActivation = now;
    toggleLoop();
}

function installMobileInputHandlers() {
    if (!isMobile || state.mobileInputHandlersInstalled) return;

    window.addEventListener('pointerdown', absorbMobileButtonEvent, true);
    window.addEventListener('pointerup', activateMobileButton, true);
    window.addEventListener('touchstart', absorbMobileButtonEvent, { capture: true, passive: false });
    window.addEventListener('touchend', activateMobileButton, { capture: true, passive: false });
    window.addEventListener('click', activateMobileButton, true);
    state.mobileInputHandlersInstalled = true;
}

function removeMobileInputHandlers() {
    if (!state.mobileInputHandlersInstalled) return;

    window.removeEventListener('pointerdown', absorbMobileButtonEvent, true);
    window.removeEventListener('pointerup', activateMobileButton, true);
    window.removeEventListener('touchstart', absorbMobileButtonEvent, true);
    window.removeEventListener('touchend', activateMobileButton, true);
    window.removeEventListener('click', activateMobileButton, true);
    state.mobileInputHandlersInstalled = false;
}

