$(document).ready(function(){

  $('#loadChallenges').on('click', onLoadChallenges);
  window.noOfChallenges = 0;
  window.activeChallenge = 1;

});

function onLoadChallenges() {
  setTimeout(function(){
	  noOfChallenges = $('.circle-singleline').length;
	  $('.circle-singleline:first').attr('data-toggle', 'popover');
	  $('.circle-singleline:first').css('background', 'purple');
	  initPopover();
  }, 1000);
 
}

function initPopover() {
  $('[data-toggle="popover"]').popover({
      html: true,
      placement: 'bottom',
      content: function() {
                  var description = $(this).data('description');
                  var audioUrl = $(this).data('audio-url');
                  var html = '\
                            <img src="http://www.public-domain-photos.com/free-cliparts-1-big/computer/applications/audacity.png" width="120" height="100" style="margin-left: 17%;" /><br />\
                            <audio src=\'' + audioUrl + '\' id="player"></audio>\
                            <progress id="seekbar" value="0" max="1" style="width: 100%"></progress><br /><br />\
                            <button class="btn btn-success btn-sm" id="play">Play</button>\
                            <button class="btn btn-info btn-sm" id="pause">Pause</button>\
                            <button class="btn btn-danger btn-sm" id="stop">Stop</button>\
                            <hr />\
                            <b><i><span style="color: #C21F39">' + description + '</span></i></b>\
                            <br /><br />\
                            <button class="btn btn-primary btn-sm btn-block" id="done">Done</button>\
                          ';
                  return html;
      },
      template: '<div class="popover" role="tooltip">\
                    <div class="popover-arrow"></div>\
                    <h3 class="popover-title"></h3>\
                    <div class="popover-content"></div>\
                  </div>'
    });

    $('.circle-singleline').on('click', registerBtnHandlers);
}

function registerBtnHandlers() {
  $('#play').on('click', play);
  $('#pause').on('click', pause);
  $('#stop').on('click', stop);
  $('#player').on('timeupdate', seek);
  $('#done').on('click', activateNextChallenge);
}

function play() {
  $('#player')[0].play();
}

function pause() {
  $('#player')[0].pause();
}

function stop() {
  $('#player')[0].pause();
  $('#player')[0].currentTime = 0;
  $('#seekbar').attr("value", 0);
}

function seek() {
  $('#seekbar').attr("value", this.currentTime / this.duration);
}

function activateNextChallenge() {
  activeChallenge++;
  if(activeChallenge <= noOfChallenges) {
    $('.circle-singleline:nth-child(' + activeChallenge + ')').attr('data-toggle', 'popover');
    $('.circle-singleline:nth-child(' + activeChallenge + ')').css('background', 'purple');
    initPopover();  
  }
}