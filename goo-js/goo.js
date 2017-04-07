(() => {
    // making goo function available as an import or in the global window object
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = goo;
    } else {
        window.goo = goo;
    }
})();
