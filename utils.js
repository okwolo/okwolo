function deep_copy(object) {
    // TODO : make a more elegant solution
    return JSON.parse(JSON.stringify(object));
}