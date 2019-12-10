# :butterfly: Hyperaudio Lite :butterfly:

:high_brightness: To make media on the web more accessible we believe that every piece of spoken-word audio and video should come with an Interactive Transcript.:high_brightness:

Hyperaudio Lite - is an [Interactive Transcript](https://en.wikipedia.org/wiki/Interactive_transcripts) Viewer 

You can user Hyperaudio Lite to provide Interactive Transcripts, this readme details why and how.

* lightweight (< 20kb)
* no framework dependencies
* MIT Licensed

## :star2: Hyper Powers :star2:

Interactive transcripts are transcripts with special powers. Hyperaudio's Interactive Transcripts are called Hypertranscripts and are infused with the following hyper-powers:

### :world_map: Navigate
Click on the text to navigate directly to the part of the audio where that word was said.
### :mag_right: Search
Find words and phrases inside your transcript and make your media search-engine friendly.
### :couple_with_heart_woman_woman: Share
Selecting part of a transcript creates a URL with timing data which when shared will take people directly to the corresponding piece of audio where the highlighted words are spoken.


## :vhs: Data Formats

Hypertranscripts contain the following data:
* Paragraphs
* Words
* Word start time (`data-m` milliseconds)
* Word duration (`data-d` milliseconds)

That's it!

Here's an example:

```html
<p>
  <span data-m="52890" data-d="0" class="speaker">Alexandra: </span>
  <span data-m="52890" data-d="90">I </span>
  <span data-m="52980" data-d="240">think </span>
  <span data-m="53220" data-d="720">unfortunately </span>
  <span data-m="53970" data-d="60">at </span>
  <span data-m="54030" data-d="60">the </span>
  <span data-m="54090" data-d="270">minute, </span>
  <span data-m="54390" data-d="180">we </span>
  <span data-m="54570" data-d="180">make </span>
  <span data-m="54750" data-d="270">people </span>
  <span data-m="55020" data-d="300">aware </span>
  <span data-m="55320" data-d="90">of </span>
  <span data-m="55410" data-d="150">their </span>
  <span data-m="55560" data-d="480">personal </span>
  <span data-m="56040" data-d="330">data </span>
  <span data-m="56370" data-d="210">when </span>
  <span data-m="56580" data-d="480">terrible </span>
  <span data-m="57060" data-d="300">things </span>
  <span data-m="57360" data-d="510">happen. </span>
</p>
```

Hyperaudio Lite is "tag agnostic" so for example, you could use other tags instead of `<span>` to wrap words.

You could also make headings link to chapter points using attributes, like this:

```html
<h5 data-m="214800">What kind of help is available for people to manage their own data?</h5>
```

We can see that a Hypertranscript is really just HTML, this helps keep it:

* :clap: extensible 
* :clap: accessible  
* :clap: readable 

### How to make a Hypertranscript

One way is to use the [Hyperaudio Converter](https://hyperaud.io/converter/)

This currently takes 3 possible inputs:

* SRT (Subtitle format)
* [Speechmatics](https://www.speechmatics.com/) JSON*
* [Gentle](https://github.com/lowerquality/gentle) JSON

*JavaScript Object Notation - a common data format

## :floppy_disk: Hyperaudio Lite Code

Essentially the Hyperaudio Lite library is made from 4 JavaScript files:

1. `hyperaudio-lite.js` - the core that deals with the linking of media to words
2. `hyperaudio-lite wrapper` - initialises Hyperaudio Lite and adds search, selection and playback rate functionality 
3. `share-this.js` - a fork of [share-this](https://github.com/MaxArt2501/share-this) library 
4. `share-this.twitter.js` - a fork of the Twitter sharing element of share-this

and the associated CSS files:

5. `hyperaudio-lite-player.css`
6. `share-this.css`

We also link to [Velocity 1.5](https://github.com/julianshapiro/velocity) for autoscroll and Twitter widget JS for Twitter sharing.

Add to your HTML file in the following way:

```HTML
<head>
  <link rel="stylesheet" href="css/hyperaudio-lite-player.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/velocity/1.5.0/velocity.js"></script>
  <script src="https://platform.twitter.com/widgets.js"></script>
</head>
```
and at the end of the `<body>`:

```html
  <script src="js/hyperaudio-lite.js"></script>
  <script src="js/hyperaudio-lite-wrapper.js"></script>
  <script src="js/share-this.js"></script>
  <script src="js/share-this-twitter.js"></script>
  <script>
    ShareThis({
      sharers: [ ShareThisViaTwitter ],
      selector: "article"
    }).init();
  </script>
</body>
```

View the source code to [http://hyperaud.io/lab/halite/v18/](https://hyperaud.io/lab/halite/v18/) for a complete example.


## :tiger: Hyperaudio Lite in the Wild

As demonstrated [http://hyperaud.io/lab/halite/v18/](http://hyperaud.io/lab/halite/v18/)

Alternative version [https://github.com/vitorio/hyperaudio-lite](https://github.com/vitorio/hyperaudio-lite)
