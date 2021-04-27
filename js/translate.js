'use strict';

var translate = (function () {

  var trans = {};

  function formatSeconds(seconds) {

    //console.log("seconds = "+seconds);
    if(typeof seconds == 'number'){ 
      return new Date(seconds.toFixed(3) * 1000).toISOString().substr(11, 12);
    } else {
      console.log("warning - attempting to format the non number: "+seconds);
      return null;
    }
  }

  trans.init = function(transcriptId, playerId, maxLength, minLength) {
    var transcript = document.getElementById(transcriptId);
    var words = transcript.querySelectorAll('[data-m]');
    var data = {};
    data.segments = [];
    var segmentIndex = 0;

    function segmentMeta(speaker, start, duration, chars) {
      this.speaker = speaker;
      this.start = start;
      this.duration = duration;
      this.chars = chars;
      this.words = [];
    }

    function wordMeta(start, duration, text) {
      this.start = start;
      this.duration = duration;
      this.text = text;
    }



    var thisWordMeta;
    var thisSegmentMeta = null;

    // defaults
    var maxLineLength = 37;
    var minLineLength = 21;

    var captionsVtt = "WEBVTT\n"

    //var endSentenceDelimiter = /[\.。?؟!]/g;
    var endSentenceDelimiter = /[\.。?!]/g;
    var midSentenceDelimiter = /[,、–，،و:，…‥]/g;

    if (!isNaN(maxLength)) {
      maxLineLength = maxLength;
    }

    if (!isNaN(minLength)) {
      minLineLength = minLength;
    }



 

    /*
    var transSentence = "";
    var transSentences = [];
    var transSentenceIndex = 0;
    var transSentencesIndexes = [];
    
    var transWords = translation.split(' ');

    console.log(transWords);



    transWords.forEach(function(word, i) {

      var lastChar = word.replace(/\s/g, '').slice(-1);
      var penultimateChar = word.replace(/\s/g, '').slice(-2);

      transSentence += word + " ";
      transSentenceIndex += word.length + 1;

      //if (lastChar.match(endSentenceDelimiter) && penultimateChar.toUpperCase() !== penultimateChar && penultimateChar.match(midSentenceDelimiter) !== true)  {
      if (lastChar.match(endSentenceDelimiter) && penultimateChar.match(midSentenceDelimiter) !== true)  {
        //console.log(sentence);
        transSentences.push(transSentence);
        transSentence = "";
        transSentencesIndexes.push(transSentenceIndex);
      }
    });

    console.log(transSentences);
    console.log(transSentencesIndexes);
    
    var sentence = "";
    var sentences = [];
    var sentenceIndex = 0;
    var sentencesIndexes = [];

    var cleanTranscript = "";

    words.forEach(function(word, i) {

      var lastChar = word.innerText.replace(/\s/g, '').slice(-1);
      var penultimateChar = word.innerText.replace(/\s/g, '').slice(-2);

      if (word.classList.contains("speaker") === false) {
        sentence += word.innerText;
        sentenceIndex += word.innerText.length;
      } 
      
      //if (lastChar.match(endSentenceDelimiter) && penultimateChar.toUpperCase() !== penultimateChar && penultimateChar.match(midSentenceDelimiter) !== true)  {
      if (lastChar.match(endSentenceDelimiter) && penultimateChar.match(midSentenceDelimiter) !== true)  {
        //console.log(sentence);
        sentences.push(sentence);
        cleanTranscript += sentence + " ";
        sentence = "";
        sentencesIndexes.push(sentenceIndex);
        
      }
    });

    console.log(sentences);
    console.log(sentencesIndexes);
    console.log("==============");
    console.log(cleanTranscript);
    console.log("==============");


*/
  

  

    // if different number of sentences let's try and flag the issue

    /*if (sentences.length !== transSentences.length) {

      var numSentences = sentences.length;
      if (transSentences.length < sentences.length) {
        numSentences = transSentences.length;
      }

      var tolerance = 0.4; // 40%

      for (var i=0; i < numSentences; i++) {
        //compare sizes

        var ratio = sentences[i].length / transSentences[i].length;
        if (ratio > (1 + tolerance) || ratio < (1 - tolerance)) {
          console.log("possible issue with sentence "+i);
        }
      }
    }*/

    // replace with your own translated array

    var translation = {
      "0": "... algo que somos capazes de consertar.",
      "1": "Desculpe. ",
      "2": "És boa, mas sim.",
      "3": "Então, sou eu. ",
      "4": "Neste momento estou trabalhando em um livro chamado Descobrindo Viés e Aprendizado de Máquina, onde mergulho super profundamente nisso, bem como todas as maneiras pelas quais podemos usar algoritmos para tentar corrigi-lo.",
      "5": "Eu adoro isso. ",
      "6": "Então eu adoraria começar. ",
      "7": "Eu sei que você falou sobre... ",
      "8": "você meio que veio de um fundo não tradicional. ",
      "9": "Eu assisto seus vídeos, com os quais estou obcecado. ",
      "10": "Você faz ótimos vídeos sob o nome Data Science Bae, que, claro, eu amo, mas eu adoraria se você pudesse nos levar através de uma espécie de como você chegou ao que está fazendo. ",
      "11": "Eu sei que você trabalhou no cinema por um tempo. ",
      "12": "Você tinha uma perspectiva interessante real chegando à tecnologia de um fundo não tradicional. ",
      "13": "Como é que me fez passar por isso?",
      "14": "Sim, tenho que começar por não saber o que queria fazer quando fui para a faculdade. ",
      "15": "Fiquei indeciso no meu primeiro ano, e passei por cursos muito rapidamente, tentei jornalismo. ",
      "16": "Eu tentei filmar, e na verdade consegui meu diploma de sócios em filme. ",
      "17": "Mas quando eu estava começando a procurar emprego, eu estava tipo, você sabe, eu não tenho certeza sobre esses dias 16 horas e, hum, o salário que eles eram queridos para as pessoas trabalhando em filmes.",
      "18": "Então eu estava tipo, eu sempre meio que gostei de tecnologia. ",
      "19": "Fiz um curso de codificação no ensino médio, e meio que mudei meu curso para ciência da computação. ",
      "20": "Esta foi a minha primeira introdução real à tecnologia. ",
      "21": "Foi muito difícil porque minhas primeiras aulas não só não eram fáceis, eu tinha, como, professores abertamente sexistas. ",
      "22": "Meu primeiro curso de ciência da computação, foi eu e outra garota, e a primeira coisa que o professor diz que entra no primeiro dia é: Ei, pessoal, eu vejo que há duas garotas aqui. ",
      "23": "Espero que vocês não falhem neste semestre. ",
      "24": "Sou o Dr., e continua como se nada tivesse acontecido.",
      "25": "Já para um mau começo.",
      "26": "Começo ruim. ",
      "27": "Começo ruim.",
      "28": "E eu já tinha muitos medos de ser a única pessoa negra na sala de aula, ser uma das duas mulheres na sala de aula e vir de um local de insegurança sobre o que eu sabia e não ser realmente extremamente forte em matemática. ",
      "29": "Como se eu estivesse em uma matemática correctiva do ensino médio até a faculdade. ",
      "30": "Como se não houvesse... ",
      "31": "Eu não sou um miúdo matemático ou garoto maravilha de qualquer maneira. ",
      "32": "Portanto, espero que as pessoas que estão interessadas em ciência de dados se sintam um pouco melhores. ",
      "33": "Mas eu era CS major por dois anos, e eu realmente não gostei dos cursos. ",
      "34": "Eu senti que não estava aprendendo a codificar ou construir coisas bem, e isso foi apenas talvez 2010. ",
      "35": "Mas eu estava aprendendo, tipo, C+ e fazendo testes de codificação no papel. ",
      "36": "Então eu estava tipo: Eu não sei se eu quero ser um engenheiro.",
      "37": "Então eu acabei transferindo escolas. ",
      "38": "Terminei meu diploma em comunicações. ",
      "39": "Consegui transferir um tipo de créditos. ",
      "40": "E eu realmente comecei a trabalhar em marketing e trabalhando em um pouco de agências de marketing antes de conseguir um emprego fazendo basicamente análise de dados das mídias sociais e promulgar dados para uma startup. ",
      "41": "Então este tipo de me expôs às startups VC estilo Silicon Valley. ",
      "42": "O tipo muito rápido de ambientes.",
      "43": "E depois de fazer isso por alguns anos... ",
      "44": "trabalhando em algumas startups diferentes, a ciência de dados começou a se tornar este campo popular. ",
      "45": "E eu pensei que se eu já estou fazendo um monte de trabalho de análise de dados, eu vou me formar nisso, e então eu realmente voltei para a escola. ",
      "46": "Mas foi muito difícil quando me formei, porque se você olhasse meus títulos de trabalho anteriores, você veria coisas como especialista em mídia social e analista social ou de dados. ",
      "47": "E tantos empregos e empresas simplesmente não me levaram a sério porque eram como: Como você passou de comunicações e mídia digital para entender coisas como testes A B e conceitos matemáticos difíceis? ",
      "48": "Então, havia muita dúvida de que eu realmente sabia do que eu estava falando, apesar de ter uma espécie de diploma no papel.",
      "49": "Bem, essa é a coisa que eu amo no seu trabalho é que você é muito claro que o seu... ",
      "50": "a perspectiva que você traz alguém que tem um fundo tecnológico não tradicional não é, não é uma falha é realmente uma coisa boa. ",
      "51": "E então eu me pergunto que isso tem ocupado o espaço permitiu que você tragesse uma perspectiva diferente para a indústria de tecnologia. ",
      "52": "Vejo você com alguém que realmente se sente confortável criticando preconceitos tecnológicos, criticando como é para as mulheres negras nesses espaços como a tecnologia é usada para prejudicar nossas comunidades. ",
      "53": "Vejo você como alguém que é muito confortável e vocal falando sobre isso. ",
      "54": "Você acha que seu passado vindo para a tecnologia não tradicionalmente tem ajudado você a esse respeito?",
      "55": "Absolutamente. ",
      "56": "Acho que tenho muito menos. ",
      "57": "Mesmo quando comecei, eu realmente não entrei em tecnologia com um tipo de olhos grandes e largos e realmente colocando muitas dessas organizações neste tipo de pedestal. ",
      "58": "Eu já sabia que havia falhas. ",
      "59": "Então, como parte do meu diploma de mídia digital que, curiosamente, foi tão criticado pelos entrevistadores.",
      "60": "Mas eu escrevi um I want to say 18 page paper na minha aula de lei de mídia de massa sobre como o Facebook violou tantas leis de privacidade. ",
      "61": "E isso foi 2013. ",
      "62": "Então eu não entendi realmente com a idéia de que essas organizações eram infalíveis ou que eles nunca construíram coisas que quebraram e que, além disso, vindo de um fundo onde eu sou de certa forma ensinado a se comunicar, ensinou a ser persuasivo e tentar atravessar meu ponto. ",
      "63": "Eu acho que foi muito mais fácil para mim entrar e traduzir algumas das tecnologias falam para pessoas que têm um fundo não tradicional ou não têm um fundo tecnológico realmente em profundidade. ",
      "64": "Então eu definitivamente acho que eu usei isso como minha superpotência, com certeza.",
      "65": "Eu adoro isso. ",
      "66": "Seu superpoder. ",
      "67": "Então, você sabe, nós começamos essa conversa falando sobre esse tipo de tipo do que eu chamo no programa muito esse tipo de hostilidade em relação a vozes externas que eu sinto que às vezes pode estar no centro da tecnologia. ",
      "68": "E muitas vezes isso é como se refere às mulheres negras, certo? ",
      "69": "É como se percebesse que o espaço tecnológico é que, se você é uma mulher negra, que de alguma forma chegou aqui por engano ou empurrou seu caminho para dentro, e que certamente não é uma centralização significativa da nossa perspectiva. ",
      "70": "Nossas vozes e o que trazemos. ",
      "71": "Essa hostilidade é algo que você viu em seu trabalho?",
      "72": "Infelizmente, sim. ",
      "73": "Então eu acho que em um monte de maneiras geral, eu tenho sorte e que eu trabalhei em organizações menores onde eles são as coisas que eu não lidei com são PIPs Performance Improvement Plan) ou como planos de melhoria onde você está meio que sentou e colocar em uma pista para melhorar.",
      "74": "Mas, as coisas que eu experimentei, eu diria, são apenas dúvida geral, e muitas vezes eu meio que sempre coloquei a culpa nisso porque eu tinha um fundo não tradicional e não querendo ver isso, corrida provavelmente jogou em que para um monte de gente, eu acho, infelizmente, para mim, tem sido mais microagressões do que tipo realmente óbvio de grandes golpes desta misoginia são ou tem sido, infelizmente, realmente sutil, coisas onde você simplesmente não é pago a mesma quantidade ou você não é considerado para o mesmo tipo de oportunidades.",
      "75": "Mas infelizmente, sim, eu acho difícil de consertar porque então temos que colocar as pessoas no poder com a responsabilidade de priorizar quem é importante, as pessoas vulneráveis e marginalizadas, ou as pessoas que têm poder e que contribuem para esse tipo de ambientes tóxicos.",
      "76": "Definitivamente. ",
      "77": "Então quero dizer, é você sabe, quando eu estava fazendo minhas perguntas para esta conversa, é difícil ter essa conversa e não ser como: Ok, então o que devemos fazer? ",
      "78": "Mas o que é difícil é que, você sabe, nós não criamos a supremacia branca, certo? ",
      "79": "Como se não fizéssemos. ",
      "80": "Este não é um Este não é um sistema que nós mesmos montamos, e quase parece desingênuo ser como: Bem, o que poderia ser feito para, você sabe, desmontar este sistema que nos oprime tanto como. ",
      "81": "Mas acho que me pergunto se há... ",
      "82": "Se houvesse alguém ouvindo, que era um tomador de decisão ou alguém com poder ou alguém que pudesse fazer mudanças reais, o que você recomendaria que eles façam para tornar as coisas menos hostis hoje? ",
      "83": "Como se fosse um ou dois passos que você pode dizer como: Isso é o que eu faria. ",
      "84": "Isso é o que eu recomendaria que alguém com poder que possa fazer mudanças reais.",
      "85": "Sim, eu diria que o primeiro passo é realmente ser capaz de identificar as pessoas que, independentemente de suas outras contribuições e seu intelecto estão contribuindo para este ambiente hostil e ser capaz de sentar, ter um entendimento e ter uma conversa muito difícil e honesta sobre como seus preconceitos infiltram em seu trabalho. ",
      "86": "Como isso se infiltra em como eles gerenciam seus funcionários e essencialmente os colocam em um plano de ação ou decidem como eles saem de uma organização. ",
      "87": "Temos que entender que estamos tão longe passado apenas consciência tipo de ser suficiente.",
      "88": "Nós temos, como uma indústria de tecnologia em geral, basicamente continuou este ciclo de danos por décadas. ",
      "89": "Então, embora não, não há muito que possamos realmente fazer para voltar cinco anos e retroceder e mudar decisões, temos que entender que isso é tão crítico, este é o ápice. ",
      "90": "Ou tomamos essa decisão de nos livrar de pessoas que contribuem para isso no local de trabalho ou avançamos com um entendimento de que nunca chegaremos à utopia de equidade tecnológica que queremos.",
      "91": "Sim, acho que é um bom ponto. ",
      "92": "Você disse que sabe que a consciência não é suficiente, e muitas vezes penso que a consciência definitivamente não é suficiente. ",
      "93": "Mas também, a visibilidade não é suficiente porque, você sabe, há tantas situações em que, você sabe, empresas de tecnologia ou plataformas vai contratar vai fazer um aluguer de alto perfil. ",
      "94": "Como eu estou pensando em pessoas como Timnet Gebru no Google e pessoas como Ifeoma Ozoma no Pinterest. ",
      "95": "Você conhece essas pessoas que lá... ",
      "96": "Você sabe, você está vendo o tipo de frutos de seu trabalho em revistas e peças de imprensa e em boas relações públicas, e eles têm muita visibilidade. ",
      "97": "E por muito tempo, pensei que, sabe, se eu fosse visível e se estivesse na mesa, então isso era bom, certo? ",
      "98": "Mas assim me protegeria. ",
      "99": "Mas a visibilidade e a consciência não nos protegem. ",
      "100": "Você sabe, isso não protegeu nenhuma dessas duas mulheres de realmente ter experiências terríveis em seu local de trabalho como experiências publicamente terríveis.",
      "101": "E então eu acho que eu gostaria que pudéssemos chegar a um lugar onde apenas fazer uma contratação entendemos que isso é ótimo, mas definitivamente não é suficiente. ",
      "102": "Precisamos ir muito mais longe e tipo, sabe, uma coisa é ter um lugar na mesa, mas você sente que pode falar? ",
      "103": "Quando você fala as pessoas, ouve? ",
      "104": "Certo, como se fosse muito mais longe do que isso.",
      "105": "Acho que bateu o prego na cabeça. ",
      "106": "É quase essa transparência radical que estamos perdendo. ",
      "107": "Vemos os frutos de seu trabalho e seus papéis e em todo o seu trabalho. ",
      "108": "Mas não vemos como eles estão sendo tratados pela gerência. ",
      "109": "Como eles, infelizmente, não estão realmente jogando no mesmo campo quanto às regras que se aplicam a eles e quais regras se aplicam aos outros, especialmente quando você olha para o Google e seu passado.",
      "110": "Infelizmente, ações judiciais, as coisas que os tipos de assentamentos que eles fizeram para pessoas que infelizmente criaram ambientes incrivelmente tóxicos como Andy Rubin não são nada em comparação. ",
      "111": "Ou eles são, pelo menos, compensados quando saem e reconhecidos por suas contribuições, independentemente de infelizmente, as consequências de suas próprias ações contra aqueles que tentam usar a tecnologia para realmente melhorar as coisas e para se comunicar de forma transparente com sua equipe, eles acabam sendo punidos.",
      "112": "Sim, isto é, isso é um conto tão antigo quanto o tempo e honestamente, é uma história da qual estou cansado. ",
      "113": "Parte de mim... ",
      "114": "Não é... ",
      "115": "quando li relatórios e estudos que estão falando sobre as mulheres negras que deixam a indústria tecnológica. ",
      "116": "É... ",
      "117": "Não é surpreendente para mim, porque o que mais você espera, certo? ",
      "118": "Tipo, quem quer trabalhar em algum lugar onde isso vai ser, você sabe, tipo: Oh, sim, você vai ter que aturar com um, você sabe, além do seu trabalho, aturar com uma série de BS racista fodida, e quando você fala sobre isso, você será visto como o mau ator, certo? ",
      "119": "Como se fosse uma daquelas coisas em que é como se eu não culpar ninguém que, depois de um tempo, apenas uma espécie de check-out. ",
      "120": "Mas esse é exatamente o problema é como se as pessoas não...",
      "121": "Se as mulheres negras não se sentem centradas e ouvidas e como seu bem-estar está protegido nesses espaços, não só isso falha essas mulheres, mas falha todos nós, você sabe, equipes não inclusivas fazem tecnologia que vai prejudicar as comunidades. ",
      "122": "E só se talvez se tivesse havido alguém que trouxe uma perspectiva diferente, essa coisa, essas coisas não aconteceria. ",
      "123": "E por isso realmente vejo que eu vejo isso como este ciclo vicioso que só vamos quebrar até que haja algum tipo de mudança significativa para manter essas equipes como inclusivas, e não apenas inclusivo onde é como se você lida com besteiras todos os dias até você quebrar e depois, você sabe, sair, mas inclusive onde é como se fosse bom aparecer. ",
      "124": "Você se sente como se estivesse centrado e ouvido e tudo isso gosta. ",
      "125": "Parece uma ordem alta, mas sinto que é o que precisamos.",
      "126": "Absolutamente. ",
      "127": "E você mencionou algo que era tão importante não apenas ter alguém que tem uma perspectiva diferente sobre a equipe para trazer à tona um problema potencial, mas na verdade ouvindo quando o fazem. ",
      "128": "Há organizações que têm essas pessoas nessas equipes e, em seguida, essas pessoas estão incrivelmente decepcionadas e sentem, você sabe, não ouviu quando eles tipo de empurrar para frente com o projeto de qualquer maneira, ou organizações vão trabalhar com empreiteiros ou consultores para fazer esse tipo exato de trabalho, e então eles ficam feedback, especialmente quando se trata de problemas algorítmicos de ok, talvez você abandone este projeto, talvez você vá por uma rota diferente e eles ignorá-lo e fazer a mesma coisa de qualquer maneira.",
      "129": "Então, até vermos, penso eu, do outro lado das coisas, a regulamentação que, na verdade, é significativa. ",
      "130": "Isso exige que essas empresas paguem multas que são grandes o suficiente para realmente machucá-las como uma organização, não vamos ver, infelizmente, vozes negras realmente ser ouvidas. ",
      "131": "Eu acho que essa é a outra metade da moeda é que quando estamos lá, se não estamos protegidos e ouvidos, ainda não somos capazes de ter esse impacto e eles podem apenas tipo de verificar o aspecto da diversidade, quando eles trazem em alguém novo, mas não realmente trabalhar para manter essa pessoa, ou tê-los dar entrada legítima ou tê-los em papéis de liderança. ",
      "132": "Eu acho que o maior problema para tantas organizações é que eles querem executar e fazer com que as pessoas olhem para seus números de diversidade. ",
      "133": "Mas quando você meio que se aprofunda em papéis técnicos para posições de liderança, você não vê o tipo de crescimento que eles realmente estão anunciando. ",
      "134": "Portanto, certificando-se de que não se trata apenas de conseguir pessoas negras como o trabalho mais baixo remunerado em sua organização.",
      "135": "Certo. ",
      "136": "E assim é... ",
      "137": "Quero dizer, eu sei que você sabe, mas é uma daquelas coisas onde é como quando você vê uma empresa que você sabe que não está fazendo as coisas da maneira que eles talvez devam ser como se trata de fazer direito por seus funcionários negros quando eles postam seu quadrado negro no Instagram) bem quando eles, quando eles, como, transformar seu logotipo para preto. ",
      "138": "Foi como: Oh, bem, isso é ótimo e tudo, mas espere um minuto. ",
      "139": "Isso é algo que você viu?",
      "140": "Absolutamente, eu acho que mesmo muito, muito recentemente, algumas coisas do Google Lá eles estão tentando educar 100 000 mulheres negras em habilidades digitais, ou eles criaram esses fundos. ",
      "141": "No entanto, eles não olham internamente e dizem: Talvez não devêssemos tratá-los da mesma maneira. ",
      "142": "É infelizmente, para organizações como o Google não é um caso único. ",
      "143": "Não é um outlier. ",
      "144": "Isto é... ",
      "145": "Isso é sistêmico e podemos assumir apenas porque aconteceu com as pessoas que estão muito voltadas para a frente e estão ficando cobertas de revistas.",
      "146": "Quando estamos falando sobre o funcionário médio que isso aconteceu com isso, sua pesquisa não está consistentemente sendo publicada pela Wired e realmente grandes pontos de notícias. ",
      "147": "O que está acontecendo lá onde não podemos supor que isso só aconteceu com uma ou duas pessoas, infelizmente.",
      "148": "Absolutamente. ",
      "149": "Eu acho que esse é um bom ponto que precisamos também lembrar, como as pessoas de alto perfil versus apenas sua pessoa cotidiana. ",
      "150": "Quero ter a conversa sobre todos. ",
      "151": "E assim é como se você tem a pessoa que é como, suas peças estão sendo colocadas em Wired e tudo isso, como também pensar no que parece, como é a experiência para todos. ",
      "152": "Acho que é um bom ponto. ",
      "153": "Sabes, este trabalho pode ser muito. ",
      "154": "E eu acho que minha pergunta para você é, já que estamos falando de bem-estar, tipo, como você encontrou maneiras de esculpir espaços para proteger sua paz neste trabalho e proteger seu senso de si mesmo e simplesmente não como, tipo, como você descobriu isso?",
      "155": "Sim, eu acho que o primeiro passo foi, acredite ou não, consciência de que isso é algo que eu preciso estar fazendo estar cuidando de mim só faz meu trabalho melhor. ",
      "156": "E acho que, obviamente, temos lidado com uma pandemia no último ano, lidando com muitas das conversas raciais públicas deste último verão. ",
      "157": "Eu percebi que eu preciso dar muito mais passos, de modo que foi uma espécie de passo um é ser capaz de aceitar isso e deixar de lado todos os estigmas que eu pessoalmente tinha sobre isso.",
      "158": "Os outros passos para mim foram a terapia, poder falar sobre essas questões que me impactam pessoalmente, em que tanto do meu trabalho, sinto que tenho que justificar minha existência ou justificar e tentar me humanizar. ",
      "159": "E isso faz um pedágio em você mentalmente. ",
      "160": "As outras partes para mim têm realmente reservado tempo para não funcionar, especialmente com a pandemia. ",
      "161": "Tem sido fácil ir 12 para 14 horas e não reconhecer que estou gastando tanto tempo exercendo essa energia mental e realmente não ser capaz de ser recarregado ou re abastecido, bem como passatempos, porque a internet sugeriu que eu deveria obter um hobby.",
      "162": "Bem, sim. ",
      "163": "O que te faz... ",
      "164": "Adoro a palavra reabastecido. ",
      "165": "O que faz você se sentir reabastecido?",
      "166": "Para mim, é muito trabalho criativo. ",
      "167": "Eu tenho que gastar tempo, não olhar para uma tela, não pensar em possibilidades algorítmicas. ",
      "168": "Então eu entrei em costura e em artesanato de resina e em muitas coisas onde eu posso meio que ver os frutos do meu trabalho, especialmente porque a escrita de livros e muito do meu outro trabalho parece muito longo prazo. ",
      "169": "Então parece que é uma maratona sem pagamento no momento. ",
      "170": "Então, ter aqueles como artesanato rápido e pouco tem sido realmente útil.",
      "171": "Sim, isso é verdade para mim também. ",
      "172": "E é um... ",
      "173": "É uma dessas frustrações onde tenho tanta sorte de estar em um lugar onde eu possa fazer isso, certo? ",
      "174": "Como nem todo mundo tem o privilégio de ser como: Oh, estou tirando uma semana de folga. ",
      "175": "Vou tirar uma semana de folga na próxima semana e vou para os Adirondacks ao lado para fazer caminhadas. ",
      "176": "E eu me lembro de pensar, se eu não sair naquela montanha, eu poderia explodir. ",
      "177": "Como eu chego ao ponto onde, tipo e é como: E se eu não pudesse fazer isso? ",
      "178": "Você sabe, há tantas pessoas lá fora que não estão em situações onde isso é possível para eles ou eles não, você sabe, nós adoramos falar como: Oh, fazer uma pausa do tempo de tela, mas que ser capaz de se afastar da sua tela por um tempo é um privilégio. ",
      "179": "E eu acho... ",
      "180": "Desejo tanto que nossas conversas sobre bem-estar e autocuidado não tivessem que se sentir tão amarrado a isso, você sabe, sistema capitalista onde algumas pessoas conseguem e algumas pessoas têm permissão para fazer isso, e algumas pessoas não são. ",
      "181": "Só pode ser frustrante.",
      "182": "Absolutamente, eu acho, especialmente porque existem tantas outras ferramentas infelizmente recentes que aprendi recentemente estão abusando dos dados que essencialmente lhes damos. ",
      "183": "Se você olhar para essas formas alternativas de terapia ou terapia aplicativos, muitos deles não têm nenhuma promessa de confidencialidade. ",
      "184": "Nós não deveríamos ter esse nível onde se você trabalha em um determinado tipo de empresa ou se você está em um determinado salário, você é capaz de ir tirar seu tempo de folga e recarregar e reabastecer quando tantas pessoas não fazem e eu... ",
      "185": "é difícil porque eu estive naquela situação em que eu tenho sido incapaz de obter esse tempo longe ou eu fui incapaz de, Eu fui incapaz de não sair da tela e ter sido meio amarrado para trabalhar por causa de nós vivemos em um sistema capitalista que requer qualquer tempo de distância Nós tomamos só é concedido a nós depois que temos dado a eles uma certa quantidade de trabalho ou depois que nós colocamos em uma certa quantidade de esforço. ",
      "186": "Há... ",
      "187": "Acho que é um grande argumento para um universal... ",
      "188": "renda básica universal. ",
      "189": "E que somos seres humanos e estamos lidando em um... ",
      "190": "lidar com um momento ridiculamente difícil em cima de tentar fazer o nosso dia de trabalho, além de tentar empurrar para a equidade racial e de gênero. ",
      "191": "Não deveria estar atado ao nosso trabalho.",
      "192": "Sim. ",
      "193": "Você... ",
      "194": "Você, por acaso, segue o Ministério da Nap?",
      "195": "Eu não sei!",
      "196": "Bem, o ministério da soneca... ",
      "197": "é incrível. ",
      "198": "Siga o Ministério da Nap no Instagram. ",
      "199": "Basicamente, é essa ideia que os cochilos descansam podem ser uma forma de reparações, certo? ",
      "200": "Isso, como nossos antepassados, não foi concedido o que você sabe, a liberdade de descansar quando eles queriam e sonhar quando eles querem. ",
      "201": "E você sabe, você precisa... ",
      "202": "você precisa ser capaz de descansar e sonhar para recarregar e como trazer o seu melhor eu criativo para sua vida e assim por... ",
      "203": "Oh, sim. ",
      "204": "Rosalind diz que eles amam Nap Ministry gritar para Rosalind.",
      "205": "Snap Ministry gritar para Rosalind.",
      "206": "É fascinante, e eu acho que é muito verdade, certo que, quando você cochila e quando você descansa, realmente pode ser uma recuperação radical e uma espécie de uma maneira de subverter esse sistema capitalista em que estamos dizendo como: Oh, você só merece um cochilo se você fizer X, Y e Z trabalho. ",
      "207": "É como, não, eu sou uma pessoa. ",
      "208": "As pessoas precisam descansar. ",
      "209": "E sabes que mais? ",
      "210": "Meus antepassados não receberam o benefício do descanso. ",
      "211": "Então eu me enrolando e tirando uma soneca no meio do dia de uma espécie de maneira, é seus sonhos mais loucos, certo? ",
      "212": "E provavelmente estão me animando. ",
      "213": "E...",
      "214": "Adoro tanto isso.",
      "215": "Sim, cochilo!",
      "216": "Meu Deus, eu amo tanto isso. ",
      "217": "E eu já adoro cochilos. ",
      "218": "E agora não me sentirei mal.",
      "219": "Sabe, para quem ouve, não se sinta mal por tirar uma soneca. ",
      "220": "Poderíamos ter feito esta sessão onde é como se tivéssemos uma soneca coletiva. ",
      "221": "É assim que estamos fazendo isso. ",
      "222": "Obrigado por colocar as informações do Ministério da Nap. ",
      "223": "Agradeço isso. ",
      "224": "Então, agora eu quero ouvir os outros. ",
      "225": "Isso vai ser um pouco de experiência. ",
      "226": "Eu realmente não facilitar chamadas de zoom com muita frequência. ",
      "227": "Vou colocar algumas conversas iniciais no chat, e eu adoraria entrar em grupos. ",
      "228": "Como eu disse anteriormente, eu adoraria se você pudesse terminar esta sessão com... ",
      "229": "Sinto que vim a conferências e falamos muito e é ótimo. ",
      "230": "E então eu saio e eu sou como: Oh, tudo isso acabou de deixar minha cabeça imediatamente. ",
      "231": "Não tenho nenhuma tomada concreta.",
      "232": "Esta é a minha tentativa de tentar mitigar isso. ",
      "233": "Eu vou dividir-nos em grupos usando a funcionalidade de zoom breakout, que eu definitivamente sei como usar. ",
      "234": "E eu vou colocar três tipos de tipo, iniciantes de conversa, perguntas, idéias no bate-papo. ",
      "235": "E assim, em seus pequenos grupos, você pode discutir qualquer coisa que venha para você. ",
      "236": "Mas, você sabe, eu adoraria se as pessoas pudessem chegar a algumas coisas concretas de como você quer um tempo esculpir para proteger seu senso de si mesmo. ",
      "237": "Ou se você é um aliado ou se você, você sabe, sentir que já está fazendo isso. ",
      "238": "Como você pode criar as condições para outra pessoa da sua equipe realmente fazer esse espaço para si? ",
      "239": "Isso faz sentido? ",
      "240": "Se as pessoas tiverem dúvidas, você pode colocá-las no chat. ",
      "241": "Tudo bem, então vou deixar as perguntas no chat, e depois vou dividir-nos em pequenos grupos, e vai funcionar perfeitamente. ",
      "242": "Já consigo sentir isso.",
      "243": "Olá, todos. ",
      "244": "Estamos voltando para o nosso grande grupo. ",
      "245": "Parece que a maioria das pessoas voltou, eu acho. ",
      "246": "Certo?",
      "247": "Acho que ainda são 10 outras pessoas para voltar.",
      "248": "OK como eu...",
      "249": "Não sei se perdemos cada um. ",
      "250": "Oh, espere. ",
      "251": "Agora...",
      "252": "Lá vamos nós. ",
      "253": "Tudo bem. ",
      "254": "Eu estava assim: Oh, todos saíram. ",
      "255": "Seria bom se fosse esse o caso, mas eu estava prestes a sentir um pouco sobre isso. ",
      "256": "Ok. ",
      "257": "Bem-vindos de volta, pessoal. ",
      "258": "Espero que tenha sido uma conversa interessante. ",
      "259": "Eu definitivamente queria criar algum espaço para as pessoas conversarem. ",
      "260": "Em nosso grupo, eu sei que Roslyn tinha uma perspectiva muito interessante, e Roslyn eu adoraria convidá-lo para compartilhar o que você veio para você em seu pequeno grupo com o resto da tripulação aqui?",
      "261": "Claro. ",
      "262": "Estávamos falando sobre a primeira pergunta, sabe, sobre o tipo de reconhecimento, experimentando hostilidade no local de trabalho. ",
      "263": "E, você sabe, eu disse que eu expressei que, você sabe, minha experiência na Mozilla. ",
      "264": "Entrei para o programa Mozilla Tech and Society Fellowship em setembro do ano passado, e por isso minha experiência tem sido ótima. ",
      "265": "Mas então eu também nuanced isso reconhecendo que minha experiência de hostilidade nesse contexto pode ser bem diferente por causa do meu contato, minha realidade vivida como um africano cercado por pessoas em grande parte negros em um país em que nosso discurso sobre a raça é bem diferente.",
      "266": "Portanto, também tem um impacto sobre como percebemos como percebemos ou como experimentamos essas coisas. ",
      "267": "Porque eu acho que o contexto norte-americano, especialmente por causa de toda a raça, como a história em torno da raça, e não apenas norte-americano, digamos, norte-americano, europeu, outro lado do equador. ",
      "268": "Conversas em torno de corrida têm sido em grande parte por causa da lenta... ",
      "269": "a lentidão em lidar com as repercussões, mas ainda meio que forçando as pessoas a viver dentro da reação dessa história. ",
      "270": "Enquanto nós temos... ",
      "271": "Nossa história racial está presa... ",
      "272": "apoiada pela nossa experiência de colonialismo. ",
      "273": "Mas depois que os colonialistas saíram e eles não saíram, mas depois que os colonialistas saíram, você sabe, foi percebido de tudo bem, como, você sabe, a coisa da corrida acabou. ",
      "274": "Nós só temos nós mesmos. ",
      "275": "E assim como... ",
      "276": "Eu questiono dentro de mim mesmo se eu iria... ",
      "277": "agora que eu trabalho em uma organização ou instituição amplamente norte-americana, se eu seria capaz de reconhecer a hostilidade ou se eu apenas, você sabe, sair de uma reunião em que há alguma microagressão e pensar: Oh, isso foi uma reunião estranha ou não pensar nada nisso, sabe? ",
      "278": "Então, eu estava apenas meio que compartilhando esse tipo de, você sabe, essa tomada. ",
      "279": "Estou no Quênia, Nairobi. ",
      "280": "Foi por isso.",
      "281": "Sim. ",
      "282": "Obrigado por compartilhar isso. ",
      "283": "Acho que foi uma perspectiva interessante. ",
      "284": "Então eu realmente aprecio você compartilhar. ",
      "285": "Sim, Tina, eu concordo. ",
      "286": "E também, eu deveria ter dito isso antes. ",
      "287": "Obrigado por usar o chat. ",
      "288": "Sinta-se livre para interrogar se você tiver dúvidas ou coisas que você deseja adicionar. ",
      "289": "Obrigado por usar isso. ",
      "290": "E obrigado, Rosalyn, por compartilhar. ",
      "291": "Ayodele, quer responder ou o que surgiu em seus pequenos grupos?",
      "292": "Sim. ",
      "293": "Então, falamos sobre tudo isso. ",
      "294": "Como, você sabe, um de nós mencionou estar no Reino Unido É um pouco diferente. ",
      "295": "Apenas meio que avisando essas hostilidades. ",
      "296": "Mas uma das coisas que eu queria, é apenas tipo de superfícies. ",
      "297": "Como eu realmente vi essa última pergunta. ",
      "298": "Então, o que é algo, concreto, realmente, você sabe, eu estou enquadrando isso como o que é algo que eu posso dizer ao meu gerente? ",
      "299": "Ou ter uma conversa com executivos de suítes C na minha organização que tornariam o local de trabalho melhor? ",
      "300": "E eu acho que por causa de onde eu trabalhei em meus títulos de trabalho, isso para mim é em torno de produtos e como desenvolvemos produtos. ",
      "301": "Eu diria a eles, um que precisamos incluir pessoas que não são necessariamente nossos usuários.",
      "302": "Então, se você está fazendo um aplicativo de moda high-end, você ainda deve estar falando com pessoas que não compram moda high-end. ",
      "303": "Dessa forma, somos capazes de obter alguma contribuição de pessoas que não estão dentro das nossas câmaras de eco. ",
      "304": "E eu odeio dizer isso, mas isso vem da pesquisa que 75% dos brancos têm redes completamente brancas. ",
      "305": "Então, quando eles estão chegando a amigos, eles estão chegando a colegas anteriores ou, você sabe, colegas de classe anteriores, eles provavelmente vão receber feedback que é muito semelhante ao feedback que eles têm. ",
      "306": "E, infelizmente, alimenta esse ciclo de feedback, e estamos desenvolvendo produtos.",
      "307": "Então, no desenvolvimento de produtos, certifique-se de incluir pessoas que você não pensa, que você não cria personas para, especialmente quando você sabe que está no Google ou algo assim. ",
      "308": "E isso afeta as pessoas, independentemente de você achar que elas são seu usuário principal. ",
      "309": "Mas eu também adoraria ouvir se alguém do grupo quisesse trazer algo e apenas uma espécie de compartilhar com o resto de nós.",
      "310": "Eu era algo que eu era, sabe, em enquadrar como se fosse, uma pergunta para, você sabe, um gerente, algo que eu vi funcionar bem, e funcionou bem comigo. ",
      "311": "Não gosto de falar, por exemplo, falar em público. ",
      "312": "Mas algo que eu pedi ao meu gerente para fazer é ajudar a compartilhar sua plataforma comigo. ",
      "313": "Certo. ",
      "314": "Então, seja isso, sim, definitivamente não meu evento de falar em público, mas publicar artigos juntos ou submeter com, você sabe, meu nome anexado a ele porque eu ajudei a torná-lo... ",
      "315": "ajuda a aumentar, como, você sabe, a confiança, minha confiança, mas também me dá a credibilidade na indústria. ",
      "316": "Que eu não teria sido concedido de outra forma. ",
      "317": "E então é uma pergunta que eu fiz e tem funcionado. ",
      "318": "Funcionou bem. ",
      "319": "Co-autor, coloque meu nome contra ele. ",
      "320": "Parece menos assustador do que chegar ao palco para uma audiência.",
      "321": "Adoro isso. ",
      "322": "Eu também acredito ou não odeio falar em público, mas você parece ótimo. ",
      "323": "E eu acho que é... ",
      "324": "Acho que é um bom lembrete de que as coisas podem parecer diferentes de como você pode pensar direito? ",
      "325": "Como compartilhar a plataforma não é necessariamente você se levantar no palco. ",
      "326": "É você ficando... ",
      "327": "Você sabe, sendo devidamente citado porque sabemos que há poder naquele devidamente citado para o seu trabalho. ",
      "328": "Como se houvesse poder nisso também. ",
      "329": "Então eu amo o que você compartilhou, então obrigado por compartilhá-lo. ",
      "330": "Mas também adoro isso, sabe, conseguir o que precisa. ",
      "331": "Parece diferente para todos. ",
      "332": "Eu gosto muito disso.",
      "333": "Obrigado por compartilhar. ",
      "334": "Alguém mais quer compartilhar o que eles falaram ou quaisquer perspectivas que eles tenham vindo para cima para eles nesta sessão?",
      "335": "Para que eu possa compartilhar minha experiência. ",
      "336": "Sou um cientista de dados baseado na Holanda. ",
      "337": "Eu trabalho na indústria farmacêutica, e sou como a única cientista de dados femininos e biraciais da minha empresa. ",
      "338": "E sempre foram muitas vezes que sempre que meu supervisor coloca meu nome para uma conferência ou para entrevista ou qualquer coisa, há sempre uma espécie de tipo, vamos apresentar o nosso cientista de dados token que acontece de ser feminino biracial, certo, como sempre que eu for apresentado dessa forma, eu me sinto um pouco prejudicada. porque eu sou tipo, eu não sei se estou aqui apenas para representação ou na verdade, porque você gosta da qualidade do meu trabalho. ",
      "339": "É, parece muito uma ação afirmativa. ",
      "340": "Aqui. ",
      "341": "Então eu estava pensando se alguém também sente o mesmo. ",
      "342": "E como eles lidam com essas instâncias?",
      "343": "Isso é um duro sim para mim. ",
      "344": "EU... ",
      "345": "Sim, eu estive em muitas organizações, e é fácil dizer, Oh, olha, você é a nossa pessoa mais visivelmente marginalizada, vá e nos representa, e então com a esperança de que isso nos faça como uma organização parecer melhor. ",
      "346": "E eu acho que é difícil porque nunca está realmente claro se é por causa do seu trabalho, pelo menos às vezes quando falar com gerentes e pessoas que estão organizando eventos, eu acho que a maneira que eu lidei com isso no passado, realmente eu trabalho com um treinador de responsabilidade que honestamente me diz para me verificar e ter um olhe para as coisas positivas que as pessoas estão dizendo no feedback sobre o meu trabalho. ",
      "347": "Estou neste nível na minha carreira, e ainda estou inseguro. ",
      "348": "Querem que eu fale só porque querem ter uma mulher negra na tela? ",
      "349": "Ou eles me querem porque eu faço um bom trabalho?",
      "350": "E eu tenho que me lembrar que, independentemente de como eles pensam, e independentemente de se é porque eles querem diversidade, eu ainda sou ótimo no que eu faço. ",
      "351": "E é difícil quando você talvez tenha um fundo não tradicional ou está visivelmente marginalizado e parece que você tem às vezes mais oportunidades. ",
      "352": "Mas o que eu diria é também cobrar mais. ",
      "353": "Não faça essas coisas de graça e, em seguida, pegue seu dinheiro como se eles querem esse PR, tire algo para você mesmo.",
      "354": "Meu Deus, estou tão feliz que tenha dito isso. ",
      "355": "Isso é tão verdade, certo? ",
      "356": "E essa é uma espécie de viagem de serem pessoas sub-representadas nesses espaços, certo? ",
      "357": "Como eu sou, tenho muita integridade. ",
      "358": "Trago muita integridade ao meu trabalho. ",
      "359": "Mas se eu vou ser... ",
      "360": "Você sabe quando você está sendo usado dessa maneira, se eu vou ser usado, há um preço em um empate certo, e eu acho que, tipo, se é assim que você se sente, acertar sua moeda, como se não sinta nenhum... ",
      "361": "Não gosto, não sinta vergonha em jogar o jogo da maneira que ele vai funcionar bem para si mesmo.",
      "362": "E eu acho que esse é um bom ponto. ",
      "363": "Só quero sublinhar, sublinhar, sublinhar. ",
      "364": "Todos nós temos integridade. ",
      "365": "Todos nós temos valores. ",
      "366": "Mas se você sabe que essas pessoas vão, tipo, estar usando você desta maneira, e todos nós sentimos que você sente isso em seu instinto quando você está sendo usado desta forma, pelo menos obter como obter sua linha de fundo para isso, como ter um tem um custo em sua cabeça e, em seguida, cobrar imposto e, em seguida, cobrar extra direito porque eu sinto como que é necessário para... ",
      "367": "Quero dizer, é quase como uma espécie de uma forma minúscula de gorjeta... ",
      "368": "de como tentar derrubar a balança um pouco. ",
      "369": "Então eu concordo completamente. ",
      "370": "Estou tão feliz que você tenha trazido isso. ",
      "371": "Um minúsculo um minúsculo.",
      "372": "Pequenas reparações do bebê. ",
      "373": "Quero dizer, quando é o mês da História Negra, eu cobro o dobro. ",
      "374": "Quando é o mês da História das Mulheres, eu cobro o dobro como nós, e é engraçado, mas eu sou como se ainda estamos fazendo trabalho extra e temos que reconhecer como, especialmente se eles estão fazendo você falar sobre raça, falar sobre gênero, falar sobre temas difíceis. ",
      "375": "Carregue mais porque ainda é trabalho emocional que você está colocando. ",
      "376": "Você está tendo que rehash todas as experiências e falar sobre isso. ",
      "377": "Certifique-se de que, no mínimo, você está bem compensado por isso.",
      "378": "Em um nível prático e talvez isso possa passar para uma conversa do Slack. ",
      "379": "Mas eu realmente adoraria falar como taticamente. ",
      "380": "Literalmente como você pede mais dinheiro? ",
      "381": "É um item de linha? ",
      "382": "É como um como uma taxa de dia aumentada? ",
      "383": "Eu adoraria ter essa conversa sobre, sabe, perguntar.",
      "384": "Posso deixar algumas dicas que usei muito rápido. ",
      "385": "Primeiro é ter ou uma página em seu site onde você tem, como o que eu acabei de usar os logotipos de empresas que eu falei antes e conversas que eu fiz antes. ",
      "386": "Você pode dizer especificamente, digamos que se eles vêm até você em um DM, aqui está a minha taxa para o próximo x período de tempo. ",
      "387": "Ou o que eu também notei obras é ter até mesmo apenas um formulário on-line onde eles podem ir e solicitar, como eles solicitariam uma empresa para uma demonstração. ",
      "388": "Ei, eu quero você para esta palestra, coloque suas informações, faça com que eles preencham um orçamento ou lista. ",
      "389": "Estes são meus... ",
      "390": "Eu tenho no meu site. ",
      "391": "Esta é uma conversa de 30 minutos, esta é uma conversa de uma hora. ",
      "392": "Todos sabiam que eu ainda não fiz trabalho para vai estar a essas taxas. ",
      "393": "E eu acho que é difícil porque não somos realmente ensinados a valorizar a nós mesmos assim. ",
      "394": "Mas isso é muito recente se você não estiver me seguindo no Twitter, mas eu realmente pedi a muitos dos meus homólogos masculinos brancos para postar o quanto eles cobram por hora, postar o quanto eles cobram por eventos. ",
      "395": "E há muitos dados realmente bons lá para entender se é assim... ",
      "396": "Quero dizer, há uns brancos fenomenalmente talentosos que cobram 500 por hora. ",
      "397": "Temos que levar isso em consideração e, sabe, ter certeza de que não estamos nos subvalorizando também.",
      "398": "Definitivamente. ",
      "399": "Então, vamos ter que parar em breve. ",
      "400": "Mas eu queria compartilhar uma dica rápida e depois juro que vou acabar, eu juro. ",
      "401": "Que é isso mesmo para... ",
      "402": "Então, quando eu estava começando, eu costumava ser como, eu não vou falar de graça mais. ",
      "403": "E o que eu realmente descobri é mesmo que lugares que não podem... ",
      "404": "Digamos que não podem te pagar, não acho que alguém possa te pagar. ",
      "405": "Mas se eles dizem que não podem, ainda pode haver algo que eles podem dar a você. ",
      "406": "E eu quero falar em uma conferência em uma conhecida Universidade Ivy League, e eles foram olhar, nós não podemos pagar você. ",
      "407": "E eu disse: Ok, bem, você pode... ",
      "408": "Posso obter cinco vagas grátis para, você sabe, para algumas das minhas pessoas como, sub-representadas que querem vir e eles fizeram isso.",
      "409": "E assim, eles deviam ter me pago. ",
      "410": "Mas pode haver uma solução alternativa como, descobrir o que pode ser onde está, Ok, se eu quiser doar meu tempo, o que posso obter isso não é necessariamente material, mas ainda vai gostar, fazer isso valer a pena? ",
      "411": "Mas você não deveria estar fazendo qualquer tipo de trabalho sem conseguir algo mesmo que não seja, você sabe, uma compensação monetária. ",
      "412": "Então eu realmente aprecio todos vocês no espaço hoje. ",
      "413": "Estou tão emocionado e grato por termos conseguido manter este espaço. ",
      "414": "Temos que terminar, mas podemos continuar essa conversa no bate-papo espacial do AI Wellness Lounge, que o link para isso está no chat de zoom.",
      "415": "Quero agradecer a todos vocês por terem vindo. ",
      "416": "Quero agradecer Ayodele por ser um co-facilitador tão maravilhoso e compartilhar a si mesmo tão lindamente. ",
      "417": "E eu quero agradecer por ser um grande Wrangler e também ser parte da conversa. ",
      "418": "Por favor, mantenha contato Ayodele. ",
      "419": "Onde as pessoas podem acompanhar todo o trabalho incrível que você está fazendo?",
      "420": "Sim, eu sou mais ativo no Twitter em datascibae. ",
      "421": "Você pode encontrar links para o meu site de lá e um monte de outras coisas que eu tenho acontecendo.",
      "422": "Incrível. ",
      "423": "E você pode me acompanhar no meu podcast. ",
      "424": "Eu coração rádio ligou. ",
      "425": "Não há garotas na internet ou siga-me no Twitter BridgetMarie. ",
      "426": "E muito obrigado pelo seu tempo hoje. ",
      "427": "Eu realmente aprecio isso.",
      "428": "Obrigado.",
      "429": "Obrigado.",
      "430": "Obrigado. "
    };

    var lastSpeaker = "";

    var sentence = "";
    var sentences = [];

    var transSentence = "";
    var transSentences = [];


    for(var i in translation) {
      transSentences.push(translation[i]);
    }

    console.log(transSentences);

    // segments are objects representing discreet parts of the transcript - all segments have one speaker and represent one sentence or partial sentence spoken by the speaker (before a speaker change)
    
    words.forEach(function(word, i) {

      if (thisSegmentMeta === null) {
        // create segment meta object
        thisSegmentMeta = new segmentMeta("", null, 0, 0, 0);
      }

      if (word.classList.contains("speaker")) {

        // checking that this is not a new segment AND a new empty segment wasn't already created
        if (thisSegmentMeta !== null && thisSegmentMeta.start !== null) { 
          //console.log("pushing...");
          //console.log(thisSegmentMeta);
          data.segments.push(thisSegmentMeta); // push the previous segment because it's a new speaker
          thisSegmentMeta = new segmentMeta("", null, 0, 0, 0);
          sentences.push(sentence);
          sentence = "";
        }

        thisSegmentMeta.speaker = word.innerText;

      } else {

        var thisStart = parseInt(word.getAttribute("data-m"))/1000;
        var thisDuration = parseInt(word.getAttribute("data-d"))/1000;

        if (isNaN(thisStart)) {
          thisStart = 0;
        }
        
        if (isNaN(thisDuration)) {
          thisDuration = 0;
        }

        var thisText = word.innerText;

        thisWordMeta = new wordMeta(thisStart, thisDuration, thisText);
        sentence += thisText;
        
        if (thisSegmentMeta.start === null) { 
          thisSegmentMeta.start = thisStart;
          thisSegmentMeta.duration = 0;
          thisSegmentMeta.chars = 0;
        }

        thisSegmentMeta.duration += thisDuration;
        thisSegmentMeta.chars += thisText.length;

        thisSegmentMeta.words.push(thisWordMeta);

        // remove spaces first just in case
        var lastChar = thisText.replace(/\s/g, '').slice(-1);
        if (lastChar.match(endSentenceDelimiter)) {
          data.segments.push(thisSegmentMeta);
          thisSegmentMeta = null;
          sentences.push(sentence);
          sentence = "";
        }
      }
    });

    console.log(data.segments);
    console.log(sentences);

    alert("DONE");

    /* ---- */

console.log("continuing....");

  
  var iDiv = document.createElement('div');
  
  /*var iTranslation = document.createElement('textarea');
  var iCleanOriginal = document.createElement('textarea');
  iTranslation.id = "translation-text";
  iCleanOriginal.id = "original-text";
  document.getElementsByTagName('body')[0].appendChild(iDiv);
  iDiv.appendChild(iCleanOriginal);
  iDiv.appendChild(iTranslation);
  document.getElementById("original-text").innerText = cleanTranscript;
  document.getElementById("translation-text").innerText = translation;*/

  document.getElementsByTagName('body')[0].appendChild(iDiv);

  console.log("here");

  var iSentenceTable = document.createElement('table');
  iSentenceTable.id = "sentence-table";

  var allSentencesLength = sentences.length;

  console.log(allSentencesLength);
  
  if (sentences.length < transSentences.length) {
    allSentencesLength = transSentences.length;
  }

  for (var c = 0; c < allSentencesLength; c++) {
    console.log(c);
    var tr = iSentenceTable.insertRow(-1);
    var td = document.createElement('td');        
    td = tr.insertCell(-1);
    td.innerHTML = "("+c+")"+sentences[c];  
    td = tr.insertCell(-1);
    td.innerHTML = "("+c+")"+transSentences[c];                 
  }

  iDiv.appendChild(iSentenceTable);


  

  /* ---- */

    //alert("segments");


    function captionMeta(start, stop, text) {
      this.start = start;
      this.stop = stop;
      this.text = text;
    }

    var captions = [];
    var thisCaption = null;

    


    data.segments.map(function(segment) {

      // If the entire segment fits on a line, add it to the captions.
      if (segment.chars < maxLineLength) {

        thisCaption = new captionMeta(formatSeconds(segment.start), formatSeconds(segment.start + segment.duration), "");
        
        segment.words.forEach(function(wordMeta) {
          thisCaption.text += wordMeta.text;
        });

        thisCaption.text += "\n";
        //console.log("0. pushing because the whole segment fits on a line!");
        //console.log(thisCaption);
        captions.push(thisCaption);
        thisCaption = null;

      } else { // The number of chars in this segment is longer than our single line maximum

        var charCount = 0;
        var lineText = "";
        var firstLine = true;
        var lastOutTime;
        var lastInTime = null;
        
        segment.words.forEach(function(wordMeta, index) {

          var lastChar = wordMeta.text.replace(/\s/g, '').slice(-1);

          if (lastInTime === null) { // if it doesn't exist yet set the caption start time to the word's start time.
            lastInTime = wordMeta.start;
          }

          // Are we over the minimum length of a line and hitting a good place to split mid-sentence?
          if (charCount + wordMeta.text.length > minLineLength && lastChar.match(midSentenceDelimiter)) {

            if (firstLine === true) {

              thisCaption = new captionMeta(formatSeconds(lastInTime), formatSeconds(wordMeta.start + wordMeta.duration), "");
              thisCaption.text += lineText + wordMeta.text + "\n"; 
              
              //check for last word in segment, if it is we can push a one line caption, if not – move on to second line

              if (index + 1 >= segment.words.length) {
                //console.log("1. pushing because we're at a good place to split, we're on the first line but it's the last word of the segment.");
                //console.log(thisCaption);
                captions.push(thisCaption);
                thisCaption = null;
              } else {
                firstLine = false;
              }

            } else { // We're on the second line ... we're over the minimum chars and in a good place to split – let's push the caption

              thisCaption.stop = formatSeconds(wordMeta.start + wordMeta.duration);
              thisCaption.text += lineText + wordMeta.text + "\n";
              //console.log("2. pushing because we're on the second line and have a good place to split");
              //console.log(thisCaption);
              captions.push(thisCaption);
              thisCaption = null;
              firstLine = true;
            }

            // whether first line or not we should reset ready for a new caption
            charCount = 0;
            lineText = "";
            lastInTime = null; 

          } else { // we're not over the minimum length with a suitable splitting point

            // If we add this word are we over the maximum?
            if (charCount + wordMeta.text.length > maxLineLength) {

              if (firstLine === true) {

                if (lastOutTime === undefined) {
                  lastOutTime = wordMeta.start + wordMeta.duration;
                }

                thisCaption = new captionMeta(formatSeconds(lastInTime), formatSeconds(lastOutTime), "");
                thisCaption.text += lineText + "\n";

                // It's just the first line so we should only push a new caption if it's the very last word!

                if (index >= segment.words.length) {
                  captions.push(thisCaption);
                  thisCaption = null;
                } else {
                  firstLine = false;
                }

              } else { // We're on the second line and since we're over the maximum with the next word we should push this caption!

                thisCaption.stop = formatSeconds(lastOutTime);
                thisCaption.text += lineText + "\n";
 
                captions.push(thisCaption);

                thisCaption = null;
                firstLine = true;
              }

              // do the stuff we need to do to start a new line
              charCount = wordMeta.text.length; 
              lineText = wordMeta.text;
              lastInTime = wordMeta.start; // Why do we do this??????

            } else { // We're not over the maximum with this word, update the line length and add the word to the text

              charCount += wordMeta.text.length;
              lineText += wordMeta.text;

            }
          }

          // for every word update the lastOutTime
          lastOutTime = wordMeta.start + wordMeta.duration;
        });
        
        // we're out of words for this segment - decision time!
        if (thisCaption !== null) { // The caption had been started, time to add whatever text we have and add a stop point
          thisCaption.stop = formatSeconds(lastOutTime);
          thisCaption.text += lineText + "\n";
          //console.log("3. pushing at end of segment when new caption HAS BEEN created");
          //console.log(thisCaption);
          captions.push(thisCaption);
          thisCaption = null;
          
        } else { // caption hadn't been started yet - create one!
          if (lastInTime !== null) { 
            thisCaption = new captionMeta(formatSeconds(lastInTime), formatSeconds(lastOutTime), lineText);
            //console.log("4. pushing at end of segment when new caption has yet to be created");
            //console.log(thisCaption);
            captions.push(thisCaption);
            thisCaption = null;  
          }
        }
      }
    });

    /* =============================================== */

    console.log(captions);

    //alert("phase 2");

  

   

    function stringsIntersect(string1, string2) {

      string1 = string1.trim();
      string2 = string2.trim();

      console.log("checking intersection for ...");

      console.log(string1);
      console.log(string2);

      if (string1 === string2) {
        console.log("sentence is *equal* to caption");
        return 1;
      }

      if (string1.indexOf(string2) >= 0) {
        console.log("caption is larger than sentence");
        return string2.length / string1.length;
      }

      if (string2.indexOf(string1) >= 0) {
        console.log("sentence is larger than caption");
        return string2.length / string1.length;
      }

      for (var i = 1; i < string1.length; i++) {
        
        if (string2.indexOf(string1.substr(i)) >= 0) {
          console.log("partial caption in sentence");
          return string1.substr(i).length / string2.length;
        }
      }

      for (var i = 1; i < string2.length; i++) {
        if (string1.indexOf(string2.substr(i)) >= 0) {
          console.log("partial sentence in caption");
          return string2.substr(i).length / string1.length;
        }
      }

      return "";

    }

    // This split includes the character used to split in the result
    function inclusiveSplit(str, char) {
      var splitArray = str.split(char);
      var index = -1;

      splitArray.forEach(function(word, i) {
        index += word.length + 1;
        splitArray[i] += str.charAt(index);
      });
      return splitArray;
    }

    function insertLineBreak(str) {
      var newStr = "";
      var split = false;
      str = str.trim();
      if (str.length > maxLineLength) {
        var words = str.split(" ");
        words.forEach(function(word){
          if ((newStr + word).length > maxLineLength && split === false) {
            newStr += "\n";
            split = true;
          }
          newStr += word + " ";
        });
        return newStr.trim();
      } else {
        return str;
      }
    }


    var transCaptionsVtt = "";

    var sentenceIndex = 0;
    var remainingSentence = null;
    var remainingTransSentence = null;
    var thisTransCaption = null;
    var transCaptionArr = [];

    captions.forEach(function(caption, c) {

      if (c > 513) {
        //alert("caption "+c);
      }

      var textToCheck = ""; 
      if (caption.stop !== "00:00:00.000") {

        console.log("==========================================");
        console.log("              new caption "+c);
        console.log("==========================================");
        
        captionsVtt += "\n" + caption.start + "-->" + caption.stop + "\n" + caption.text + "\n";
        console.log(caption.start + "-->" + caption.stop + "\n" + caption.text + "\n");

        var captionText = caption.text.replace(/(\r\n|\n|\r)/gm, ""); // remove line break
        textToCheck += captionText;

        var matchTolerance = 0.4; // change the way this works!

        var thisSentence = null;
        var thisTransSentence = null;

        console.log("sentenceIndex = "+sentenceIndex);

        for (var i = sentenceIndex; i < sentences.length; i++) {

          if (remainingSentence !== null) {
            thisSentence = remainingSentence;
          } else {
            thisSentence = sentences[i];
          }

          
          if (remainingTransSentence !== null) {
            thisTransSentence = remainingTransSentence;
          } else {
            thisTransSentence = transSentences[i];
          }

          var intersection = stringsIntersect(captionText, thisSentence);
          console.log("------------");
          console.log("intersection");
          console.log(intersection);
          console.log("to be a match it should be > "+(1 - matchTolerance));
    
          
          if ((intersection > (1 - matchTolerance))) { // looks like a match
            console.log(captionText);
            console.log(thisSentence);
            console.log("Match!!!");
            // we found a match now let's see what part of the next sentence fits in the caption

            if (intersection === 1){ // exact match - sentence matches caption


              thisTransCaption = new captionMeta(caption.start, caption.stop, thisTransSentence);
              transCaptionArr.push(thisTransCaption);

              console.log("-----{}{}{}{}{}{}-----");
              console.log("case 1 ...");
              console.log(caption.start + "-->" + caption.stop + "\n" + thisTransSentence);

              if (thisTransSentence.length > 0) {
                transCaptionsVtt += "\n" + caption.start + "-->" + caption.stop + "\n" + insertLineBreak(thisTransSentence) + "\n";
              }
              
              remainingSentence = null;
              remainingTransSentence = null;
              sentenceIndex++;
              
            } else if (intersection < 1) { // sentence is smaller than caption
              // add this sentence to vtt output and figure out how much of following sentences to add
              var captionSentence = thisTransSentence;
              
              console.log("check remaining string with next sentence");
              intersection = stringsIntersect(captionText.replace(thisSentence,""), sentences[i+1]);
              console.log("next sentence intersection with text remaining in caption "+captionText.replace(thisSentence,""));
              console.log(sentences[i+1]);
              console.log("next intersection");
              console.log(intersection);

              if (intersection === 1){ // exact match - next sentence matches remains of caption
                captionSentence += transSentences[i+1];

                thisTransCaption = new captionMeta(caption.start, caption.stop, captionSentence);
                transCaptionArr.push(thisTransCaption);
                console.log("-----{}{}{}{}{}{}-----");
                console.log("case 2 ...");
                console.log(caption.start + "-->" + caption.stop + "\n" + captionSentence);
                if (captionSentence.length > 0) {
                  transCaptionsVtt += "\n" + caption.start + "-->" + caption.stop + "\n" + insertLineBreak(captionSentence) + "\n";
                }
              } else if (intersection < 1) { // sentence is smaller than remaining caption
                captionSentence += transSentences[i+1];
                intersection = stringsIntersect(captionText.replace(sentence[i+1],""), sentences[i+2]);
              } else if (intersection > 1) { // sentence is larger than remaining caption
                console.log("sentence is larger than remaining caption...");
              }

              remainingSentence = null;
              remainingTransSentence = null;
              sentenceIndex++;

            } else if (intersection > 1) {// sentence is larger than caption
              
              console.log("sentence is larger than caption");
              // figure out where to split sentence
              // first see if splitting by mid-sentence delimiters give us the same number of splits in both languages
              var sentenceSplit; 
              var transSentenceSplit; 

              console.log("<== spliting sentences into smaller chunks ===>");
              sentenceSplit = inclusiveSplit(thisSentence, midSentenceDelimiter);
              transSentenceSplit = inclusiveSplit(thisTransSentence, midSentenceDelimiter);
              console.log(sentenceSplit);
              console.log(transSentenceSplit);
              console.log("<=============================================>");

 
              var testSentence = "";
              var fitSentence = "";
              var fitTransSentence = "";
              var chunkIndex = 0; // should this be null or -1 initially?

              if (sentenceSplit.length === transSentenceSplit.length) {
                // figure out where original sentence split
                console.log("same number of sentence chunks...");

                sentenceSplit.forEach(function(chunk, i) {
                  testSentence += chunk;
                  if (captionText.indexOf(testSentence.trim()) >= 0) {
                    fitSentence = testSentence;
                    fitTransSentence += transSentenceSplit[chunkIndex];
                    chunkIndex++;
                  }
                });
  
                console.log("part of sentence that fits = "+ fitSentence);
                console.log("chunk index = "+ chunkIndex);

                
              }

              captionSentence = "";

              if (chunkIndex > 0) {// found a matching chunk(s) (greater than zero because chunKindex gets imcremented)

                // build up equivalent from translated sentence
                for (var i=0; i < chunkIndex; i++) {
                  captionSentence += transSentenceSplit[i];
                }
                
                console.log("testSentence = "+testSentence);
                console.log("fitSentence = "+fitSentence);
                console.log("captionText = "+captionText);

                // trim() removes whitespace from both ends of a string

                if (fitSentence.trim() === captionText.trim()) { // if the chunk matches the text exactly we can add the translated version

                  thisTransCaption = new captionMeta(caption.start, caption.stop, captionSentence);
                  transCaptionArr.push(thisTransCaption);

                  console.log("-----{}{}{}{}{}{}-----");
                  console.log("case 3 ...");
                  console.log(caption.start + "-->" + caption.stop + "\n" + captionSentence);

                  if (captionSentence.length > 0) {
                    transCaptionsVtt += "\n" + caption.start + "-->" + caption.stop + "\n" + insertLineBreak(captionSentence) + "\n";
                  }
                  
                  console.log("this sentence = "+thisSentence);
                  remainingSentence = thisSentence.substr(fitSentence.length);
                  remainingTransSentence = thisTransSentence.substr(captionSentence.length);
                  //remainingSentence = thisSentence.substr(fitSentence.length + 1);
                  //remainingTransSentence = thisTransSentence.substr(captionSentence.length + 1);

                } else {
                  // add remaining text to matching chunk until we fit the caption text
                  // split next chunk into words

                  var thisSentenceWords = sentenceSplit[chunkIndex].trim().split(" ");
                  var thisTransSentenceWords = transSentenceSplit[chunkIndex].trim().split(" ");

                  console.log(thisSentenceWords);
                  console.log(thisTransSentenceWords);

                  var buildIndex = 0;
                
                  var testingSentence = "";
                  var buildingSentence = fitSentence + " ";
                  var buildingTransSentence = fitTransSentence + " ";

                  thisSentenceWords.forEach(function(word, i) {
                    //add spaces between words
                    if (i > 0) {
                      testingSentence += " ";
                    }
  
                    testingSentence += thisSentenceWords[i];
  
                    //console.log("testingSentence = "+testingSentence);
  
                    if (captionText.indexOf(testingSentence.trim()) >= 0) {
                      buildingSentence += thisSentenceWords[i] + " ";

                      if (typeof thisTransSentenceWords[i] !== 'undefined') {
                        buildingTransSentence += thisTransSentenceWords[i] + " ";
                      }
                      
                      //console.log("thisTransSentenceWords["+i+"] = " + thisTransSentenceWords[i]);
                      //console.log("buildingTransSentence = "+buildingTransSentence);
                    }
                  });

                  thisTransCaption = new captionMeta(caption.start, caption.stop, buildingTransSentence);
                  transCaptionArr.push(thisTransCaption);
  
                  console.log("-----{}{}{}{}{}{}-----");
                  console.log("case 4 ...");
                  console.log(caption.start + "-->" + caption.stop + "\n" + buildingTransSentence);

                  if (buildingTransSentence.length > 0) {
                    transCaptionsVtt += "\n" + caption.start + "-->" + caption.stop + "\n" + insertLineBreak(buildingTransSentence) + "\n";
                  }
                  
                  console.log("constructing the remaining sentences .........");
                  console.log("thisSentence = "+thisSentence);
                  console.log("buildingSentence.length = "+buildingSentence.length);
  
                  remainingSentence = thisSentence.substr(buildingSentence.length);
                  remainingTransSentence = thisTransSentence.substr(buildingTransSentence.length);
                }

              } else { // assume that chunk is longer than caption text or chunks couldn't be matched, split into wordds

                var thisSentenceWords = thisSentence.split(" ");
                var thisTransSentenceWords = thisTransSentence.split(" ");
                // build up matching partial sentence
                
                var buildIndex = 0;
                
                var testingSentence = "";
                var buildingSentence = "";
                var buildingTransSentence = "";                

                thisSentenceWords.forEach(function(word, i) {
                  //add spaces between words
                  if (i > 0) {
                    testingSentence += " ";
                  }

                  testingSentence += thisSentenceWords[i];


                  if (captionText.indexOf(testingSentence.trim()) >= 0) {
                    buildingSentence += thisSentenceWords[i] + " ";

                    if (typeof thisTransSentenceWords[i] !== 'undefined') {
                      buildingTransSentence += thisTransSentenceWords[i] + " ";
                    }
                    //console.log("thisTransSentenceWords["+i+"] = " + thisTransSentenceWords[i]);
                    //console.log("buildingTransSentence = "+buildingTransSentence);
                  }
                });

                thisTransCaption = new captionMeta(caption.start, caption.stop, buildingTransSentence);
                transCaptionArr.push(thisTransCaption);

                console.log("-----{}{}{}{}{}{}-----");
                console.log("case 5 ...");
                console.log(caption.start + "-->" + caption.stop + "\n" + buildingTransSentence);

                if (buildingTransSentence.length > 0) {
                  transCaptionsVtt += "\n" + caption.start + "-->" + caption.stop + "\n" + insertLineBreak(buildingTransSentence) + "\n";
                }

                console.log("constructing the remaining sentences .........");
                console.log("thisSentence = "+thisSentence);
                console.log("thisTransSentence = "+thisTransSentence);
                console.log("buildingSentence.length = "+buildingSentence.length);

                remainingSentence = thisSentence.substr(buildingSentence.length);
                remainingTransSentence = thisTransSentence.substr(buildingTransSentence.length);
              }

              
              console.log("remainingSentence = "+remainingSentence);
              console.log("remainingTransSentence = "+remainingTransSentence);
            }
            
            

            console.log("================================================================");
            console.log("moving on to next caption, starting from sentence "+sentenceIndex);
            break;
          }
        }
      }
      console.log(transCaptionsVtt);
    });

    console.log("finished");

    //document.getElementById(playerId+'-vtt').setAttribute("src", 'data:text/vtt,'+encodeURIComponent(captionsVtt));
    alert("captions ...");
    console.log(captionsVtt);

    // ----------- //
    var iCaptionTable = document.createElement('table');
    iCaptionTable.id = "caption-table";

    var allCaptionsLength = captions.length;
    
    if (captions.length < transCaptionArr.length) {
      allCaptionsLength = transCaptionArr.length;
    }

    console.log(allCaptionsLength);


    for (var c = 0; c < allCaptionsLength; c++) {
      console.log(c);
      var tr = iCaptionTable.insertRow(-1);
      var td = document.createElement('td');      
      td = tr.insertCell(-1);
      if (c < captions.length) {
        td.innerHTML = "("+c+")"+captions[c].text;  
      }
      td = tr.insertCell(-1);
      if (c < transCaptionArr.length) {
        td.innerHTML = "("+c+")"+transCaptionArr[c].text;   
      }              
    }

    

    iDiv.appendChild(iCaptionTable);


    var iTransMarkup = document.createElement('textarea');
    iTransMarkup.id = "translation-markup";
    iDiv.appendChild(iTransMarkup);
    // ----------- //

    console.log("about to create transcript");

    createTransTranscript(transCaptionArr);

  }

  function vttTimeToMs(vttTime){
    var part = vttTime.split(".");
    var a = part[0].split(":");
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
    var ms = seconds * 1000 + (+part[1]);
    return ms;
  }

 

  function createTransTranscript(captionArr) {

    var transcriptMarkup = "<article><section>";

    captionArr.forEach(function(caption, i) {
      var startTime = vttTimeToMs(caption.start);
      var stopTime = vttTimeToMs(caption.stop);
      var duration = (+stopTime) - (+startTime);
      console.log(startTime);
      console.log(caption.text);
      var element = document.querySelector('[data-m="'+startTime+'"]');
      console.log(element);

      if (element === null) { // rounding error
        element = document.querySelector('[data-m="'+(startTime+1)+'"]');
      }

      if (element.previousElementSibling === null) {
        if (i > 0) { //close previous para
          transcriptMarkup += "</p>\n\n<p>";
        } else {
          transcriptMarkup += "<p>";
        }
        console.log("start para");
      }
          
      if (element.classList.contains("speaker")) {
        transcriptMarkup += '<span class="speaker" data-m="'+startTime+'" data-d="0">'+element.innerText+'</span>\n';
      }
      transcriptMarkup += '<span data-m="'+startTime+'" data-d="'+duration+'">'+caption.text+'</span>\n';
      

    });
    transcriptMarkup += "</p>\n<section><article>";
    console.log(transcriptMarkup);
    //------//
    
    document.getElementById("translation-markup").innerText = transcriptMarkup;
    
    //------//
  }

  return trans;

});