import { getParameter } from './utils';

const defaults = {
  scroll: true
};

const HyperaudioLite = (player, transcript, options = {}) => {
  options = Object.assign({}, defaults, options);

  const words = transcript.getElementsByTagName('a');
  const paras = transcript.getElementsByTagName('p');

  let paraIndex = 0;

  words[0].classList.add('active');
  paras[0].classList.add('active');

  const start = getParameter('s');
  let end = parseFloat(getParameter('d')) + parseFloat(start);

  transcript.addEventListener('click', (e) => {
    const target = (e.target) ? e.target : e.srcElement;
    target.setAttribute('class', 'active');
    const timeSecs = parseInt(target.getAttribute('data-m'), 10) / 1000;

    if (!isNaN(parseFloat(timeSecs))) {
      end = null;
      player.currentTime = timeSecs;
      player.play();
    }
  }, false);

  player.addEventListener('timeupdate', (e) => {
    // check for end time of shared piece
    if (end && (end / 10 < player.currentTime)) {
      player.pause();
      end = null;
    }

    const activeitems = transcript.getElementsByClassName('active');
    const activeitemsLength = activeitems.length;

    for (let a = 0; a < activeitemsLength; a++) {
      if (activeitems[a]) { // TODO: look into why we need this
        activeitems[a].classList.remove('active');
      }
    }

    // Establish current paragraph index
    let currentParaIndex;

    for (let i = 1; i < words.length; i++) {
      if (parseInt(words[i].getAttribute('data-m'))/1000 > player.currentTime) {
        // TODO: look for a better way of doing this
        const strayActive = transcript.getElementsByClassName('active')[0];
        strayActive.classList.remove('active');

        // word time is in the future - set the previous word as active.
        words[i - 1].classList.add('active');
        words[i - 1].parentNode.classList.add('active');

        for (let a = 0; a < paras.length; a++) {
          if (paras[a].classList.contains('active')) {
            currentParaIndex = a;
            break;
          }
        }

        if (options.scroll && typeof Velocity !== 'undefined' && currentParaIndex !== paraIndex) {
          try {
            Velocity(words[i].parentNode, 'scroll', {
              container: transcript,
              duration: 800,
              delay: 0
            });
          } catch (ignored) {}
          paraIndex = currentParaIndex;
        }

        break;
      }
    }
  }, false);

  if (!isNaN(parseFloat(start))) {
    player.currentTime = start / 10;
    player.play();
  }
};

export default (playerId, transcriptId, options) => {
  const player = document.getElementById(playerId);
  const transcript = document.getElementById(transcriptId);

  return new HyperaudioLite(player, transcript, options);
};
