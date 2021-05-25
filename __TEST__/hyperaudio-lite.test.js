const { test } = require('@jest/globals');
const {add, hyperaudiolite} = require('../js/hyperaudio-lite');

/*test('adds 1 + 2 to equal 3', () => {
  expect(add(1, 2)).toBe(3);
});*/

/*test('hyperaudiolite adds 1 + 2 to equal 3', () => {
  let ht = hyperaudiolite();
  expect(ht.add(1, 2)).toBe(3);
});*/

let wordArr = [];

function createWordArray(words) {
  for (let i = 0; i < words.length; ++i) {
    const m = parseInt(words[i].getAttribute('data-m'));
    let p = words[i].parentNode;
    while (p !== document) {
      if (p.tagName.toLowerCase() === 'p' || p.tagName.toLowerCase() === 'figure' || p.tagName.toLowerCase() === 'ul') {
        break;
      }
      p = p.parentNode;
    }
    wordArr[i] = { 'n': words[i], 'm': m, 'p': p }
  }

  for (let i = 0; i < wordArr.length; ++i) {
    wordArr[i].n.classList.add("unread");
  }

  return wordArr;
}

test('createWordArray', () => {
  document.body.innerHTML =
    '<article>' +
      '<section>' +
        '<p><span data-m="880" data-d="539">test </span><span data-m="2560" data-d="459">one </span><span data-m="3240" data-d="370">two </span><span data-m="3950" data-d="410">three </span><span data-m="4750" data-d="459">four </span></p>' +
        '<p><span data-m="6580" data-d="530">test </span><span data-m="8099" data-d="439">five </span><span data-m="8740" data-d="509">six </span><span data-m="9469" data-d="540">seven </span><span data-m="10280" data-d="330">eight </span></p>' +
      '</section>' +
    '</article>';

    const words = document.querySelectorAll('[data-m]');

    const expectedResult = createWordArray(words);

    //const expectedResult = [{"m": 880, "n": '<span class="unread" data-d="539" data-m="880">test </span>', "p": '<p><span class="unread" data-d="539" data-m="880">test </span><span class="unread" data-d="459" data-m="2560">one </span><span class="unread" data-d="370" data-m="3240">two </span><span class="unread" data-d="410" data-m="3950">three </span><span class="unread" data-d="459" data-m="4750">four </span></p>'}, {"m": 2560, "n": '<span class="unread" data-d="459" data-m="2560">one </span>', "p": '<p><span class="unread" data-d="539" data-m="880">test </span><span class="unread" data-d="459" data-m="2560">one </span><span class="unread" data-d="370" data-m="3240">two </span><span class="unread" data-d="410" data-m="3950">three </span><span class="unread" data-d="459" data-m="4750">four </span></p>'}, {"m": 3240, "n": '<span class="unread" data-d="370" data-m="3240">two </span>', "p": '<p><span class="unread" data-d="539" data-m="880">test </span><span class="unread" data-d="459" data-m="2560">one </span><span class="unread" data-d="370" data-m="3240">two </span><span class="unread" data-d="410" data-m="3950">three </span><span class="unread" data-d="459" data-m="4750">four </span></p>'}, {"m": 3950, "n": '<span class="unread" data-d="410" data-m="3950">three </span>', "p": '<p><span class="unread" data-d="539" data-m="880">test </span><span class="unread" data-d="459" data-m="2560">one </span><span class="unread" data-d="370" data-m="3240">two </span><span class="unread" data-d="410" data-m="3950">three </span><span class="unread" data-d="459" data-m="4750">four </span></p>'}, {"m": 4750, "n": '<span class="unread" data-d="459" data-m="4750">four </span>', "p": '<p><span class="unread" data-d="539" data-m="880">test </span><span class="unread" data-d="459" data-m="2560">one </span><span class="unread" data-d="370" data-m="3240">two </span><span class="unread" data-d="410" data-m="3950">three </span><span class="unread" data-d="459" data-m="4750">four </span></p>'}, {"m": 6580, "n": '<span class="unread" data-d="530" data-m="6580">test </span>', "p": '<p><span class="unread" data-d="530" data-m="6580">test </span><span class="unread" data-d="439" data-m="8099">five </span><span class="unread" data-d="509" data-m="8740">six </span><span class="unread" data-d="540" data-m="9469">seven </span><span class="unread" data-d="330" data-m="10280">eight </span></p>'}, {"m": 8099, "n": '<span class="unread" data-d="439" data-m="8099">five </span>', "p": '<p><span class="unread" data-d="530" data-m="6580">test </span><span class="unread" data-d="439" data-m="8099">five </span><span class="unread" data-d="509" data-m="8740">six </span><span class="unread" data-d="540" data-m="9469">seven </span><span class="unread" data-d="330" data-m="10280">eight </span></p>'}, {"m": 8740, "n": '<span class="unread" data-d="509" data-m="8740">six </span>', "p": '<p><span class="unread" data-d="530" data-m="6580">test </span><span class="unread" data-d="439" data-m="8099">five </span><span class="unread" data-d="509" data-m="8740">six </span><span class="unread" data-d="540" data-m="9469">seven </span><span class="unread" data-d="330" data-m="10280">eight </span></p>'}, {"m": 9469, "n": '<span class="unread" data-d="540" data-m="9469">seven </span>', "p": '<p><span class="unread" data-d="530" data-m="6580">test </span><span class="unread" data-d="439" data-m="8099">five </span><span class="unread" data-d="509" data-m="8740">six </span><span class="unread" data-d="540" data-m="9469">seven </span><span class="unread" data-d="330" data-m="10280">eight </span></p>'}, {"m": 10280, "n": '<span class="unread" data-d="330" data-m="10280">eight </span>', "p": '<p><span class="unread" data-d="530" data-m="6580">test </span><span class="unread" data-d="439" data-m="8099">five </span><span class="unread" data-d="509" data-m="8740">six </span><span class="unread" data-d="540" data-m="9469">seven </span><span class="unread" data-d="330" data-m="10280">eight </span></p>'}];

    //const expectedResult = '[{"m": 880, "n": <span class="unread" data-d="539" data-m="880">test </span>, "p": <p><span class="unread" data-d="539" data-m="880">test </span><span class="unread" data-d="459" data-m="2560">one </span><span class="unread" data-d="370" data-m="3240">two </span><span class="unread" data-d="410" data-m="3950">three </span><span class="unread" data-d="459" data-m="4750">four </span></p>}, {"m": 2560, "n": <span class="unread" data-d="459" data-m="2560">one </span>, "p": <p><span class="unread" data-d="539" data-m="880">test </span><span class="unread" data-d="459" data-m="2560">one </span><span class="unread" data-d="370" data-m="3240">two </span><span class="unread" data-d="410" data-m="3950">three </span><span class="unread" data-d="459" data-m="4750">four </span></p>}, {"m": 3240, "n": <span class="unread" data-d="370" data-m="3240">two </span>, "p": <p><span class="unread" data-d="539" data-m="880">test </span><span class="unread" data-d="459" data-m="2560">one </span><span class="unread" data-d="370" data-m="3240">two </span><span class="unread" data-d="410" data-m="3950">three </span><span class="unread" data-d="459" data-m="4750">four </span></p>}, {"m": 3950, "n": <span class="unread" data-d="410" data-m="3950">three </span>, "p": <p><span class="unread" data-d="539" data-m="880">test </span><span class="unread" data-d="459" data-m="2560">one </span><span class="unread" data-d="370" data-m="3240">two </span><span class="unread" data-d="410" data-m="3950">three </span><span class="unread" data-d="459" data-m="4750">four </span></p>}, {"m": 4750, "n": <span class="unread" data-d="459" data-m="4750">four </span>, "p": <p><span class="unread" data-d="539" data-m="880">test </span><span class="unread" data-d="459" data-m="2560">one </span><span class="unread" data-d="370" data-m="3240">two </span><span class="unread" data-d="410" data-m="3950">three </span><span class="unread" data-d="459" data-m="4750">four </span></p>}, {"m": 6580, "n": <span class="unread" data-d="530" data-m="6580">test </span>, "p": <p><span class="unread" data-d="530" data-m="6580">test </span><span class="unread" data-d="439" data-m="8099">five </span><span class="unread" data-d="509" data-m="8740">six </span><span class="unread" data-d="540" data-m="9469">seven </span><span class="unread" data-d="330" data-m="10280">eight </span></p>}, {"m": 8099, "n": <span class="unread" data-d="439" data-m="8099">five </span>, "p": <p><span class="unread" data-d="530" data-m="6580">test </span><span class="unread" data-d="439" data-m="8099">five </span><span class="unread" data-d="509" data-m="8740">six </span><span class="unread" data-d="540" data-m="9469">seven </span><span class="unread" data-d="330" data-m="10280">eight </span></p>}, {"m": 8740, "n": <span class="unread" data-d="509" data-m="8740">six </span>, "p": <p><span class="unread" data-d="530" data-m="6580">test </span><span class="unread" data-d="439" data-m="8099">five </span><span class="unread" data-d="509" data-m="8740">six </span><span class="unread" data-d="540" data-m="9469">seven </span><span class="unread" data-d="330" data-m="10280">eight </span></p>}, {"m": 9469, "n": <span class="unread" data-d="540" data-m="9469">seven </span>, "p": <p><span class="unread" data-d="530" data-m="6580">test </span><span class="unread" data-d="439" data-m="8099">five </span><span class="unread" data-d="509" data-m="8740">six </span><span class="unread" data-d="540" data-m="9469">seven </span><span class="unread" data-d="330" data-m="10280">eight </span></p>}, {"m": 10280, "n": <span class="unread" data-d="330" data-m="10280">eight </span>, "p": <p><span class="unread" data-d="530" data-m="6580">test </span><span class="unread" data-d="439" data-m="8099">five </span><span class="unread" data-d="509" data-m="8740">six </span><span class="unread" data-d="540" data-m="9469">seven </span><span class="unread" data-d="330" data-m="10280">eight </span></p>}]';

    let ht = hyperaudiolite();
    expect(ht.createWordArray(words)).toStrictEqual(expectedResult);


});