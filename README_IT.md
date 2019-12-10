# :butterfly: Hyperaudio Lite :butterfly:

:high_brightness: Per rendere più accessibili i contenuti multimediali sul Web, riteniamo che ogni parte di audio e video a parola parlata debba essere accompagnata da una trascrizione interattiva (Interactive Transcript). :high_brightness:

Hyperaudio Lite - è un visualizzatore di [Interactive Transcripts](https://en.wikipedia.org/wiki/Interactive_transcripts).

È possibile utilizzare Hyperaudio Lite per fornire Interactive Transcripts, questo file readme spiega perché e come.

* leggero (< 20kb)
* nessuna dipendenza dal framework
* Licenza MIT

## :star2: Iper Poteri :star2:

Interactive transcripts sono trascrizioni con poteri speciali. Le trascrizioni interattive di Hyperaudio sono chiamate Hypertranscripts e sono infuse con i seguenti iperpoteri:

### :world_map: Navigare
Fai clic sul testo per navigare direttamente nella parte dell'audio in cui è stata detta la parola.
### :mag_right: Ricerca
Trova parole e frasi nella tua trascrizione e rendi i tuoi media 'search-engine friendly'.
### :couple_with_heart_woman_woman: Share
La selezione di parte di una trascrizione crea un URL con i dati di temporizzazione che, se condivisi, porteranno le persone direttamente al pezzo audio corrispondente dove vengono pronunciate le parole evidenziate.


## :vhs: Formati di Dati

Gli hypertranscript contengono i seguenti dati::
* Paragrafi
* Parole
* Tempo inizio della parola (`data-m` millisecondi)
* Durata della parola (`data-d` millisecondi)

Fine!

Esempio:

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

Hyperaudio Lite è "tag agnostico", ad esempio, è possibile utilizzare altri tag diversi da `<span>` per racchiudere le parole.

Puoi anche creare collegamenti delle intestazioni ai punti del capitolo usando gli attributi, come questo:

```html
<h5 data-m="214800">What kind of help is available for people to manage their own data?</h5>
```

Vediamo che un Hypertranscript è in realtà solo HTML, questo aiuta a mantenerlo:

* :clap: estensibile 
* :clap: accessibile  
* :clap: leggibile

###Come creare un Hypertranscript

Un modo è usare il [Hyperaudio Converter](https://hyperaud.io/converter/)

Questo richiede attualmente 3 possibili input:

* SRT (formato dei sottotitoli)
* [Speechmatics](https://www.speechmatics.com/) JSON*
* [Gentle](https://github.com/lowerquality/gentle) JSON

*JavaScript Object Notation - un formato di dati comune

## :floppy_disk: Hyperaudio Lite Codice

In sostanza la libreria Hyperaudio Lite è composta da 4 file JavaScript:

1. `hyperaudio-lite.js` - il nucleo che si occupa del collegamento dei media alle parole
2. `hyperaudio-lite wrapper` - inizializza Hyperaudio Lite e aggiunge funzionalità di ricerca, selezione e velocità di riproduzione 
3. `share-this.js` - un fork della libreria [share-this] (https://github.com/MaxArt2501/share-this)
4. `share-this.twitter.js` - un fork dell'elemento di condivisione Twitter di share-this

e i file CSS associati:

5. `hyperaudio-lite-player.css`
6. `share-this.css`

Colleghiamo anche a [Velocity 1.5] (https://github.com/julianshapiro/velocity) per autoscroll e widget JS di Twitter per la condivisione di Twitter.

Aggiungi al tuo file HTML nel modo seguente:

```HTML
<head>
  <link rel="stylesheet" href="css/hyperaudio-lite-player.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/velocity/1.5.0/velocity.js"></script>
  <script src="https://platform.twitter.com/widgets.js"></script>
</head>
```
e alla fine di `<body>`:

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

Visualizza il codice sorgente su [http://hyperaud.io/lab/halite/v18/](https://hyperaud.io/lab/halite/v18/) per un esempio completo.


## :tiger: Hyperaudio Lite in the Wild

Come dimostrato [http://hyperaud.io/lab/halite/v18/](http://hyperaud.io/lab/halite/v18/)

Versione alternativa [https://github.com/vitorio/hyperaudio-lite](https://github.com/vitorio/hyperaudio-lite)
