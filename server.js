const io = require('socket.io')(3000, {
    cors: { origin: "*" } // Tüm bağlantılara izin ver
  });
  
  console.log("Subtitle Server started on port 3000...");
  
  io.on('connection', (socket) => {
    console.log("Bir cihaz bağlandı:", socket.id);
  
    // Öğretmenden altyazı geldiğinde
    socket.on('subtitle', (text) => {
      // Bu metni kendisine bağlanan HERKESE (öğrencilere) gönderir
      socket.broadcast.emit('subtitle', text);
      console.log("Yayınlanan Altyazı:", text);
    });
  
    socket.on('disconnect', () => {
      console.log("Cihaz ayrıldı.");
    });
  });