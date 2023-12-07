export default function registeredGraphEvent(type, cb) {
    if (!cb) {
        throw new Error('callback is not defined');
    }
    if (typeof cb !== 'function') {
        throw new Error('callback is not a function');
    }
    this.graph.on(type, function (ev) {
        cb(ev);
    });
}