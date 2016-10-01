// module.exports = function(socket) {
//   socket.on('send:message', function(data) {
//     socket.broadcast.emit('send:message', {
//       // user: name,
//       text: data.message
//     });
//   });
// };

var open_sockets = new Array();


module.exports = {
  init: function (socket) {

    open_sockets.push(socket);


    socket.on('send:alert', function (data) {
      // console.log(data);
      socket.broadcast.emit('send:alert', {
        pid: data.pid,
        iid: data.iid,
        parmid: data.parmid,
        pointid: data.pointid,
        pointname: data.pointname,
        value: data.value,
        timestamp: data.timestamp,
        alarm: data.alarm,
        title: data.title,
        min: data.min,
        max: data.max
      });
    });



    socket.on('send:value', function (data) {
      // console.log(data);
      socket.broadcast.emit('send:value', {
        pid: data.pid,
        iid: data.iid,
        parmid: data.parmid,
        pointid: data.pointid,
        value: data.value
      });
    });


    socket.on('update:warroom', function (data) {
      console.log("warroom");
      console.log(data);

      socket.broadcast.emit('update:warroom', {
        notif: data.notif
      });
    });

    
    socket.on('send:generateNotification', function (data) {
      // console.log(data);
      socket.broadcast.emit('send:generateNotification', {
        occurrence: data
      });
    });

    
    socket.on("disconnect", function () {
      console.log("user left...");
      open_sockets.splice(open_sockets.indexOf(socket), 1);
    });

  },

  broadcastAll: function(message_type, data){
    // console.log("broadcastAll");
    // console.log(message_type);
    // console.log(data);

    // o open_sockets devia ser copiado para uma stack
    // depois, usando um setTimeout entre cada, fazemos pop e enviamos.
    // isto para evitar enviar a msg ao mm tempo, e evitar
    // levar todos os clients a fazerem um read à nossa API

    open_sockets.forEach(function(s){
      s.emit(message_type, data);
    })
  }
}