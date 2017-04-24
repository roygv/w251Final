///////  Notification Center ///////

var nbNotifications = 0;

function render_notification(v, d) {
    return v + "<div class='delay notibox'><span onclick='notifClick(this);' style='cursor:pointer;' id='"+ d.nodeID +"'><b>"+ (d.date.toTimeString().split(' ')[0]) +"</b> (Notification #"+ d.alertID +") <br />\
    "+ d.nature + " at "+ d.name +" </span><br /> <br /> \
    <div class='delay cancel'>Dismiss</div> \
    <div class='delay solved'>Resolved</div> \
    <div class='delay escalate'>Escalate</div> \
    </div>"
}


function notififCenter(){d3.csv("data/alert_data.csv", type_alert, function(error, data) {
       if (error) throw error;
       
       var n = data.length;
       var notif_text = "";
       
       for (var i = 0; i < data.length; i++) {
       var notif_text = render_notification(notif_text, data[i]);
       }
       
       $('#notificationCenter').html(notif_text);
       
       nbNotifications = data.length;
       $('#nbNotifications').html(nbNotifications);
       
                                });};

notififCenter()

function type_alert(d) {
    d.date = new Date(d.date);
    d.alertID = +d.alertID;
    d.nodeID = +d.nodeID;
    return d;
}

function notifClick(d){
    console.log("notif"+d.id)
    updateNode(d.id);
}


$(document).on("click", ".toggle, .sidetoggle", function () {
                                $(".sidebar").toggleClass('active');
                                });

$(document).on("click",".cancel, .solved", function () {
               $(this).parent().toggleClass('gone');
               nbNotifications += -1;
               $('#nbNotifications').html(nbNotifications);
               });

$(document).on("click",".escalate", function () {
               $(this).parent().toggleClass('escalated');
               });
