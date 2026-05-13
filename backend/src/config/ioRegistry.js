/** Giữ tham chiếu Socket.IO để controller / job gọi emit sau khi tạo DB. */

let ioInstance = null;

export function setIo(io) {
	ioInstance = io;
}

export function getIo() {
	return ioInstance;
}
