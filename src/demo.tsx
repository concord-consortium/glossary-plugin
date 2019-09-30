import * as React from "react";
import * as ReactDOM from "react-dom";
import GlossaryPopup from "./components/plugin/glossary-popup";
import GlossarySidebar from "./components/plugin/glossary-sidebar";

// tslint:disable-next-line:no-console
const newUserDefinition = (userDefinition: string) => { console.log("User definition:", userDefinition); };

// tslint:disable-next-line:max-line-length
const img = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Blausen_0328_EarAnatomy.png/500px-Blausen_0328_EarAnatomy.png";
const video = "https://upload.wikimedia.org/wikipedia/commons/e/e3/View_of_Cape_Town_from_Table_mountain_01.mp4";

ReactDOM.render(
  <GlossaryPopup
    word="eardrum"
    definition="An eardrum is a membrane, or thin piece of skin, stretched tight like a drum."
    imageUrl={img}
    imageCaption="Source: Wikipedia. This is a test caption. This is a test caption. This is a test caption."
    videoUrl={video}
    videoCaption="Source: Wikimedia. This video is unrelated to an eardrum. This is a test caption."
    userDefinitions={[]}
  />,
  document.getElementById("popup1") as HTMLElement
);

ReactDOM.render(
  <GlossaryPopup
    word="eardrum"
    definition="An eardrum is a membrane, or thin piece of skin, stretched tight like a drum."
    imageUrl={img}
    videoUrl={video}
    videoCaption="Source: Wikimedia. This video is unrelated to an eardrum. This is a test caption."
    userDefinitions={["I don't know", "Still not sure", "Something in the ear", "A membrane"]}
    askForUserDefinition={true}
    onUserDefinitionsUpdate={newUserDefinition}
  />,
  document.getElementById("popup2") as HTMLElement
);

ReactDOM.render(
  <GlossarySidebar
    definitions={[
      {
        word: "eardrum",
        definition: "An eardrum is a membrane, or thin piece of skin, stretched tight like a drum.",
        image: img,
        imageCaption: "Source: Wikipedia. This is a test caption. This is a test caption. This is a test caption.",
        video,
        videoCaption: "Source: Wikimedia. This video is unrelated to an eardrum. This is a test caption."
      },
      {
        word: "cloud",
        definition: "A visible mass of condensed watery vapour floating in the atmosphere.",
      }
    ]}
    learnerDefinitions={{cloud: ["I don't know", "Still not sure", "Something in the air", "White fluffy thing"]}}
  />,
  document.getElementById("sidebar") as HTMLElement
);

/* tslint:disable */
const bigGlossary = [
  {
    "word": "massa",
    "definition": "faucibus eget tortor facilisis ut id nisl ac est elementum eu vel integer penatibus ornare amet interdum mauris malesuada montes"
  },
  {
    "word": "tincidunt",
    "definition": "eget purus at convallis nisl tortor enim nisl bibendum a suspendisse penatibus semper nisi massa cras tincidunt rhoncus turpis eget"
  },
  {
    "word": "dui",
    "definition": "lectus nibh rhoncus eget ac quis varius nisl odio arcu quam neque neque nisi egestas nec auctor felis vitae bibendum"
  },
  {
    "word": "ut",
    "definition": "nunc viverra eget blandit morbi felis lorem semper amet arcu tellus interdum rhoncus amet ac semper nullam eu eleifend amet"
  },
  {
    "word": "ornare",
    "definition": "lorem enim habitasse volutpat velit donec consequat arcu amet ultrices proin pharetra viverra libero arcu nunc blandit aliquet dictumst ultricies"
  },
  {
    "word": "lectus",
    "definition": "quis accumsan pulvinar sit in proin felis sed accumsan lacus adipiscing aliquet odio magnis feugiat vestibulum amet nulla pulvinar eget"
  },
  {
    "word": "sit",
    "definition": "mattis dui a sit pulvinar id eget nec dolor euismod sed sed ac sapien vel platea neque sed auctor porttitor"
  },
  {
    "word": "amet",
    "definition": "tincidunt ultrices ut elit viverra eget ut parturient nam ac at sed faucibus malesuada id id sagittis scelerisque viverra dolor"
  },
  {
    "word": "est",
    "definition": "quis morbi a nulla vestibulum suspendisse etiam sit porta eget eget cras potenti mi quis nulla pharetra ac leo at"
  },
  {
    "word": "placerat",
    "definition": "ut nisi venenatis feugiat porttitor accumsan tincidunt neque id hac in tincidunt vel non ornare auctor pulvinar eget nulla tincidunt"
  },
  {
    "word": "in",
    "definition": "nunc blandit porttitor arcu auctor integer in ut maecenas aliquam consequat eget quis bibendum vitae ullamcorper faucibus libero libero ut"
  },
  {
    "word": "egestas",
    "definition": "sed in sed aliquam mauris faucibus sit potenti leo at ullamcorper sed neque aliquam magna porttitor ultricies tortor habitasse nisl"
  },
  {
    "word": "erat",
    "definition": "bibendum cras ut nisi donec nibh sapien maecenas adipiscing commodo eu feugiat sapien nibh nibh ut potenti ipsum tortor nibh"
  },
  {
    "word": "imperdiet",
    "definition": "enim egestas tortor arcu turpis enim eget sit enim proin mus interdum in aliquet mauris dictum sollicitudin faucibus pellentesque laoreet"
  },
  {
    "word": "sed",
    "definition": "faucibus amet laoreet sit dictumst mauris suspendisse vivamus porta lobortis mus et mattis et imperdiet est tempus turpis aliquam lacus"
  },
  {
    "word": "euismod",
    "definition": "porta bibendum nunc ac sed leo nibh volutpat bibendum viverra ultricies nisl laoreet cursus sit purus pulvinar arcu et cras"
  },
  {
    "word": "nisi",
    "definition": "nulla sit sit quis luctus vel nunc arcu lacus montes quis a neque imperdiet in porta viverra sit sagittis eget"
  },
  {
    "word": "porta",
    "definition": "id mattis vivamus volutpat nunc consectetur in enim sit tincidunt in vitae tincidunt risus accumsan quam nunc semper commodo vulputate"
  },
  {
    "word": "lorem",
    "definition": "lectus ut lobortis sed risus et in sit erat nunc porttitor velit mattis quam velit neque velit ornare nunc gravida"
  },
  {
    "word": "mollis",
    "definition": "ullamcorper vitae nunc libero velit bibendum libero quis enim duis facilisis eget in amet arcu amet sed ut congue euismod"
  },
  {
    "word": "aliquam",
    "definition": "vitae proin vitae est nisl consequat et nisi faucibus auctor sagittis aenean varius est nunc pulvinar semper leo integer quam"
  },
  {
    "word": "porttitor",
    "definition": "mi nisi semper semper eu vel interdum nascetur amet sit leo neque ipsum magnis a lorem ac integer vulputate volutpat"
  },
  {
    "word": "leo",
    "definition": "in sapien aliquet pharetra sed enim velit dui tincidunt nullam consectetur ipsum ultricies nunc elementum sit purus arcu lacus eget"
  },
  {
    "word": "a",
    "definition": "viverra mus tempor a varius libero mi aenean at tortor auctor dignissim felis nam ornare eget dictum et vitae gravida"
  },
  {
    "word": "diam",
    "definition": "sit leo at mi leo turpis arcu neque mi mi quam blandit sem erat eu id neque amet nisi tellus"
  },
  {
    "word": "sollicitudin",
    "definition": "vulputate massa nibh viverra gravida mi proin arcu laoreet arcu integer semper urna interdum justo amet nec mi tincidunt tincidunt"
  },
  {
    "word": "tempor",
    "definition": "massa vitae commodo enim amet venenatis suspendisse at sit est faucibus ullamcorper risus neque massa vestibulum felis montes ultricies cursus"
  },
  {
    "word": "id",
    "definition": "facilisis amet elementum magna varius volutpat non id nec malesuada semper proin sed quis ut nibh ut nunc magnis volutpat"
  },
  {
    "word": "eu",
    "definition": "ultrices vitae vulputate eu euismod bibendum et natoque neque enim adipiscing ullamcorper augue diam ut id nulla ultrices imperdiet ornare"
  },
  {
    "word": "nisl",
    "definition": "ut pharetra proin donec cursus a risus nec non rhoncus blandit nec scelerisque varius nam duis mi id egestas arcu"
  },
  {
    "word": "nunc",
    "definition": "viverra dui leo dui congue libero amet id integer vivamus egestas vel pharetra egestas amet pulvinar eget nullam a cursus"
  },
  {
    "word": "mi",
    "definition": "turpis pulvinar in vitae libero a malesuada id viverra suscipit vel nisl sapien nunc tincidunt consequat sed velit dui ut"
  },
  {
    "word": "ipsum",
    "definition": "auctor felis imperdiet suspendisse diam tortor rhoncus egestas arcu cras feugiat dis egestas ut imperdiet sit id nullam vel lobortis"
  },
  {
    "word": "faucibus",
    "definition": "risus nec lectus enim dolor enim vulputate egestas velit elementum duis orci ac ullamcorper faucibus donec in ornare eget potenti"
  },
  {
    "word": "vitae",
    "definition": "dictumst mi vel parturient aliquam non et varius tincidunt nec pharetra id pretium vel egestas lectus parturient fermentum facilisis felis"
  },
  {
    "word": "aliquet",
    "definition": "elementum proin imperdiet faucibus at pulvinar et ullamcorper id commodo egestas massa nec libero sapien nam nisi natoque mauris sit"
  },
  {
    "word": "nec",
    "definition": "sit nulla imperdiet eu vitae leo purus sociis viverra aliquet gravida blandit id ornare bibendum cursus turpis sit duis faucibus"
  },
  {
    "word": "ullamcorper",
    "definition": "sem ut neque adipiscing rhoncus proin nec aliquet eget sem diam neque ut ornare dolor accumsan viverra leo enim accumsan"
  },
  {
    "word": "risus",
    "definition": "non euismod nec diam non tortor amet ac consequat risus tortor mattis sed vel accumsan integer volutpat eu nisl libero"
  },
  {
    "word": "nullam",
    "definition": "augue sed adipiscing est faucibus morbi enim tempor convallis lacus at porttitor nulla ac volutpat nunc erat malesuada id vel"
  },
  {
    "word": "eget",
    "definition": "massa nullam libero tempor arcu faucibus elit consectetur quis ipsum ligula montes mi auctor tortor lacus ut tellus eu arcu"
  },
  {
    "word": "felis",
    "definition": "egestas massa id maecenas cursus orci pulvinar tellus nisl viverra nunc porta in vitae vivamus purus nisl nunc mi tempor"
  },
  {
    "word": "lobortis",
    "definition": "ullamcorper ornare ut pharetra arcu leo libero eu justo risus vitae cras semper nisi quisque mi id tincidunt gravida sit"
  },
  {
    "word": "mattis",
    "definition": "mattis neque euismod sed arcu faucibus ultrices arcu fermentum nulla sed facilisis amet est neque morbi viverra imperdiet sit mattis"
  },
  {
    "word": "purus",
    "definition": "interdum ornare sed pharetra interdum id consectetur venenatis quis eleifend tellus vel mattis amet sit ornare fermentum dis blandit tempor"
  },
  {
    "word": "feugiat",
    "definition": "sagittis in ultrices eu sagittis massa nisl feugiat laoreet montes gravida viverra placerat lectus mollis rhoncus enim elit vulputate etiam"
  },
  {
    "word": "pretium",
    "definition": "accumsan sit nisi dui porttitor ut tincidunt est suscipit faucibus amet lectus magna feugiat duis elit arcu montes ac maecenas"
  },
  {
    "word": "fusce",
    "definition": "vel lectus arcu suspendisse nisi cum auctor lectus arcu id id accumsan commodo interdum sagittis porttitor nisi suspendisse sit id"
  },
  {
    "word": "velit",
    "definition": "accumsan amet diam quam pretium amet amet imperdiet faucibus dui magna arcu enim sed tempus augue parturient potenti amet posuere"
  },
  {
    "word": "tortor",
    "definition": "non quam ut tempus ut velit nulla cursus mi sociis placerat consequat tellus in amet platea viverra nunc id tempor"
  },
  {
    "word": "viverra",
    "definition": "aliquet vel rhoncus sem sed eu id nunc sit ut volutpat fermentum elementum quam velit lorem pretium semper purus duis"
  },
  {
    "word": "suspendisse",
    "definition": "ut nunc rhoncus ac facilisis nulla ultrices imperdiet porttitor vel ut ac consequat arcu tellus tempor vivamus quam ut lectus"
  },
  {
    "word": "potenti",
    "definition": "porta ornare diam feugiat sed volutpat euismod nullam at malesuada ullamcorper et lectus diam nec pretium sagittis nibh ultricies cum"
  },
  {
    "word": "ac",
    "definition": "quam vel vitae nunc at sagittis mattis eget ut leo interdum facilisis vulputate eu faucibus cras arcu facilisis a gravida"
  },
  {
    "word": "lacus",
    "definition": "purus nunc consequat massa neque at mi nunc mattis sed euismod ornare nisl eget velit cras blandit pharetra consequat porta"
  },
  {
    "word": "tellus",
    "definition": "ullamcorper elit diam eget maecenas enim id at vitae sagittis nascetur quis semper molestie aliquam velit ullamcorper sem porttitor elementum"
  },
  {
    "word": "hac",
    "definition": "volutpat sit purus auctor tortor sed id non id nec molestie tincidunt bibendum est feugiat dui nullam lectus nulla facilisis"
  },
  {
    "word": "habitasse",
    "definition": "eget ut purus lectus in mi quisque quis scelerisque accumsan lorem interdum sit sit ac neque cras dui dui tincidunt"
  },
  {
    "word": "platea",
    "definition": "ac vel mi pretium mi porta convallis lorem imperdiet imperdiet faucibus in facilisis scelerisque purus volutpat ut etiam imperdiet sociis"
  },
  {
    "word": "dictumst",
    "definition": "ullamcorper ut viverra orci ultrices quam felis ac vitae ut imperdiet ullamcorper augue nunc non vel imperdiet euismod molestie auctor"
  },
  {
    "word": "vestibulum",
    "definition": "lectus laoreet orci semper porta felis vel aliquam quis dis quisque est commodo nec integer orci id leo nisl at"
  },
  {
    "word": "rhoncus",
    "definition": "faucibus elit velit dui faucibus varius nec ullamcorper morbi eu augue ut sit volutpat accumsan in purus ultrices viverra facilisis"
  },
  {
    "word": "pellentesque",
    "definition": "ullamcorper ut leo cum id pretium nibh sapien integer non bibendum sit mattis risus nisl eget viverra consectetur viverra quis"
  },
  {
    "word": "elit",
    "definition": "diam tincidunt ut montes ac tellus at vitae ullamcorper arcu ac sed tincidunt dictum ligula neque lobortis tortor lacus venenatis"
  },
  {
    "word": "dignissim",
    "definition": "mattis leo maecenas massa vestibulum egestas duis suspendisse eget nunc purus at at ut mattis et sagittis est lectus euismod"
  },
  {
    "word": "cras",
    "definition": "mi justo ut dictum nisl nisi faucibus ut viverra libero malesuada nulla ut amet natoque in tellus ornare lectus sit"
  },
  {
    "word": "vivamus",
    "definition": "amet sem nisi nulla pharetra est nulla quisque in massa magnis amet tempus faucibus sapien in aliquam natoque porttitor ut"
  },
  {
    "word": "at",
    "definition": "imperdiet velit enim ornare amet interdum massa malesuada tempus feugiat neque interdum porta nunc arcu nisi etiam at montes integer"
  },
  {
    "word": "augue",
    "definition": "dictum at odio neque tempor aliquam ut consectetur imperdiet turpis enim massa dictum vulputate amet nunc volutpat congue in id"
  },
  {
    "word": "arcu",
    "definition": "orci nec mattis nunc pharetra vitae felis enim tortor arcu sed accumsan faucibus ac magnis urna porttitor sed dui fusce"
  },
  {
    "word": "dictum",
    "definition": "etiam consequat nascetur porttitor tortor nec aliquet nisi vitae cras dui feugiat gravida mattis eu ullamcorper varius purus enim neque"
  },
  {
    "word": "varius",
    "definition": "consequat aliquam blandit rhoncus sem libero vel feugiat molestie orci malesuada orci massa mi tincidunt elit massa faucibus integer accumsan"
  },
  {
    "word": "duis",
    "definition": "proin sit quis nullam arcu et consectetur libero nulla consectetur augue parturient lobortis laoreet mattis justo augue quam montes nam"
  },
  {
    "word": "consectetur",
    "definition": "est amet velit pharetra turpis dictumst ullamcorper in vitae purus eget ut ornare cras in consectetur turpis nisl tincidunt pulvinar"
  },
  {
    "word": "donec",
    "definition": "sit vestibulum mattis penatibus sed sed et nunc facilisis viverra massa venenatis proin bibendum duis dictum consectetur mi pellentesque vel"
  },
  {
    "word": "sapien",
    "definition": "tortor in nec imperdiet faucibus sagittis sed donec pharetra nisi sit lectus accumsan dolor amet imperdiet purus lobortis sit leo"
  },
  {
    "word": "et",
    "definition": "lacus arcu lorem eget sit ut tincidunt tempor pharetra malesuada ac integer consectetur faucibus nisl lobortis varius tortor id sed"
  },
  {
    "word": "molestie",
    "definition": "viverra arcu scelerisque ut quis vitae viverra id consequat facilisis in bibendum dictumst tempor vel ac consequat arcu nam dis"
  },
  {
    "word": "morbi",
    "definition": "tellus nulla sagittis feugiat erat mauris nullam at integer imperdiet porta dui in nibh sed velit dignissim enim viverra ultricies"
  },
  {
    "word": "accumsan",
    "definition": "augue neque diam mattis blandit viverra vitae dui lacus feugiat tincidunt vulputate cras amet faucibus lorem urna amet ornare suspendisse"
  },
  {
    "word": "scelerisque",
    "definition": "augue ornare quam faucibus tincidunt molestie aliquet nunc vulputate diam faucibus nibh est tempor nec faucibus viverra pretium magna bibendum"
  },
  {
    "word": "ultrices",
    "definition": "id vulputate nisl mattis amet lobortis urna placerat sit purus in quisque nec ac faucibus sed cursus sed vestibulum enim"
  },
  {
    "word": "auctor",
    "definition": "habitasse est eu nunc quam eget tincidunt feugiat massa nunc nec sem lobortis nunc sit amet imperdiet eget ullamcorper natoque"
  },
  {
    "word": "bibendum",
    "definition": "amet luctus leo tortor leo feugiat eu amet a quis cursus nunc nunc at sit enim neque sapien est neque"
  },
  {
    "word": "vel",
    "definition": "metus hac lorem varius amet cursus gravida tempor nunc vestibulum in laoreet ullamcorper volutpat enim eu suspendisse viverra et sapien"
  },
  {
    "word": "pharetra",
    "definition": "leo varius sed risus consequat purus sit enim lobortis proin mattis eu nulla accumsan enim odio aliquam lacus eget tortor"
  },
  {
    "word": "turpis",
    "definition": "leo quam nam ridiculus pulvinar tortor vel enim posuere ornare imperdiet maecenas ac volutpat lectus ultricies luctus libero nibh proin"
  },
  {
    "word": "dolor",
    "definition": "metus neque justo mauris duis ac cras nullam in eget euismod sit arcu tortor dis risus pretium maecenas lobortis id"
  },
  {
    "word": "enim",
    "definition": "egestas mi sagittis vitae eget accumsan elementum massa est justo maecenas velit viverra ut vestibulum eu enim nisl laoreet velit"
  },
  {
    "word": "facilisis",
    "definition": "sit nunc aliquam tempor nam felis egestas sed nisl lectus molestie ipsum neque tincidunt auctor fusce penatibus blandit blandit morbi"
  },
  {
    "word": "gravida",
    "definition": "commodo velit arcu consequat proin arcu morbi quisque suspendisse ullamcorper rhoncus arcu quis sapien nunc placerat id bibendum proin ac"
  },
  {
    "word": "neque",
    "definition": "enim nulla posuere eu ultrices ornare dui amet in est viverra varius vel elementum turpis quis vivamus sagittis orci mauris"
  },
  {
    "word": "convallis",
    "definition": "tincidunt eget libero suscipit quam justo ut tempor mauris accumsan purus mi augue donec leo nulla mauris scelerisque venenatis quam"
  },
  {
    "word": "semper",
    "definition": "ac sed enim lorem sed dui enim neque platea aenean purus a hac elementum gravida arcu lectus montes nunc libero"
  },
  {
    "word": "tempus",
    "definition": "ut lectus ac nibh mauris adipiscing viverra feugiat quis nulla tellus augue massa tempor aliquam enim sit est aliquam quis"
  },
  {
    "word": "quam",
    "definition": "duis nisl nec sit mattis arcu pellentesque nam sem sit nullam euismod consectetur risus bibendum eget in aliquet dui consequat"
  },
  {
    "word": "nam",
    "definition": "lorem ut bibendum rhoncus sed elit montes bibendum natoque aliquam maecenas risus pharetra leo vestibulum aenean enim id nisi proin"
  },
  {
    "word": "sem",
    "definition": "lacus magna sit tortor sed consequat vestibulum nunc lacus accumsan vestibulum habitasse nulla sit neque in tincidunt dui commodo aenean"
  },
  {
    "word": "consequat",
    "definition": "viverra aliquet nullam porta diam vitae neque tortor ut ornare ultricies porta accumsan diam nisi justo tempus ac dui egestas"
  },
  {
    "word": "nibh",
    "definition": "massa vitae eu felis id molestie montes ridiculus elit penatibus bibendum vulputate integer sollicitudin tellus aliquet diam gravida id ut"
  },
  {
    "word": "venenatis",
    "definition": "bibendum tincidunt molestie tortor rhoncus feugiat volutpat laoreet sit odio enim sit et nunc tellus eu nisl gravida ut vel"
  },
  {
    "word": "sagittis",
    "definition": "pellentesque placerat ut pulvinar rhoncus justo accumsan semper nullam luctus hac tellus justo cras diam viverra amet vitae at mollis"
  },
  {
    "word": "pulvinar",
    "definition": "egestas ut elit adipiscing pretium tortor purus mi justo nisl viverra egestas leo luctus ut rhoncus platea in ornare morbi"
  },
  {
    "word": "elementum",
    "definition": "viverra consectetur feugiat id consectetur lorem nibh nisi quam mi suscipit lectus metus sed ultricies ut ac vitae at sagittis"
  },
  {
    "word": "integer",
    "definition": "lectus nisi eu diam purus lectus velit sapien tincidunt a porta lectus viverra leo etiam mattis nec congue enim diam"
  },
  {
    "word": "volutpat",
    "definition": "tortor ornare ullamcorper malesuada vitae volutpat ut rhoncus amet leo eu augue pretium viverra libero ornare aliquam arcu aliquam ornare"
  },
  {
    "word": "quis",
    "definition": "nulla urna porttitor ut imperdiet nulla in enim viverra consectetur donec amet cum purus lacus proin duis vulputate imperdiet vitae"
  },
  {
    "word": "nulla",
    "definition": "ut eget imperdiet tincidunt mi ipsum venenatis egestas luctus eget euismod metus ligula gravida sed diam justo blandit nam nec"
  },
  {
    "word": "metus",
    "definition": "nibh tincidunt eget dui nam tempus id non nisi ornare pretium aliquam fermentum duis id nullam laoreet eget nibh integer"
  },
  {
    "word": "vulputate",
    "definition": "etiam vitae proin id duis at mattis auctor donec ac quam pharetra eget elementum nulla ultrices risus non sit pharetra"
  },
  {
    "word": "proin",
    "definition": "justo augue mattis suscipit neque varius euismod ornare elit lorem ac ac sit ut nibh eu mattis enim massa ultricies"
  },
  {
    "word": "fermentum",
    "definition": "velit vitae eget cras a eget sed sapien pharetra lectus lorem ac faucibus amet sit aliquet aliquet viverra ac vitae"
  },
  {
    "word": "orci",
    "definition": "faucibus aenean viverra non mi mi pellentesque habitasse sit porta dui lectus ullamcorper egestas suspendisse mi varius mollis semper purus"
  },
  {
    "word": "non",
    "definition": "diam nam turpis molestie ut nisi sit tincidunt sed quam lobortis cursus turpis cras lorem nunc id nunc amet ac"
  },
  {
    "word": "laoreet",
    "definition": "facilisis maecenas sem amet viverra bibendum vel vivamus habitasse penatibus lacus lorem nisl morbi nulla et purus elit integer ultrices"
  },
  {
    "word": "interdum",
    "definition": "nullam nunc sed vitae diam arcu dui consectetur nec feugiat nulla suscipit nibh bibendum sed auctor ridiculus nascetur laoreet orci"
  },
  {
    "word": "libero",
    "definition": "est nibh in sed proin magnis bibendum interdum nibh arcu porttitor nisi morbi tortor mattis purus sed purus cras vitae"
  },
  {
    "word": "magna",
    "definition": "tellus dignissim lacus lectus pretium interdum mauris non eget proin faucibus ornare donec dignissim nec arcu arcu pharetra libero lectus"
  },
  {
    "word": "etiam",
    "definition": "at vel maecenas donec egestas sem libero fusce faucibus euismod porta lorem ac sed ligula dis ornare lectus amet convallis"
  },
  {
    "word": "blandit",
    "definition": "quisque blandit scelerisque ultricies sagittis id sociis blandit ornare viverra lacus ultricies ornare porttitor risus vestibulum nec mattis a malesuada"
  },
  {
    "word": "cursus",
    "definition": "feugiat sapien dictum nec neque dui tortor habitasse neque magna enim leo fusce eget arcu proin ridiculus a aliquam sit"
  },
  {
    "word": "malesuada",
    "definition": "eu consectetur nisl elementum vitae porttitor arcu justo porttitor nunc semper nam viverra enim blandit consectetur varius arcu rhoncus sapien"
  },
  {
    "word": "cum",
    "definition": "pulvinar a mi faucibus vitae nisl lacus non nunc vitae viverra vulputate id molestie sed amet cras leo in vulputate"
  },
  {
    "word": "sociis",
    "definition": "enim dolor pellentesque libero ullamcorper nulla libero nec mi purus mi neque nisl integer leo tortor aliquam at integer lobortis"
  },
  {
    "word": "natoque",
    "definition": "felis quam amet tempus sed enim laoreet leo enim bibendum magnis sed massa eget tempor amet faucibus ut nulla nisl"
  },
  {
    "word": "penatibus",
    "definition": "neque porttitor arcu sit rhoncus eu diam ac aliquet interdum mi lobortis volutpat morbi mi mi donec urna bibendum ullamcorper"
  },
  {
    "word": "magnis",
    "definition": "augue lobortis nibh vestibulum faucibus neque diam viverra sagittis dui enim rhoncus pulvinar duis quis vitae elementum risus dolor non"
  },
  {
    "word": "dis",
    "definition": "eu sed arcu cursus augue vitae faucibus nullam sociis nisi diam faucibus nulla est amet et eget integer id nisl"
  },
  {
    "word": "parturient",
    "definition": "nulla nunc amet sem habitasse nisi eu sed cras tincidunt nunc enim lectus semper imperdiet ullamcorper lobortis porttitor pellentesque cum"
  },
  {
    "word": "montes",
    "definition": "mattis sit bibendum potenti suspendisse integer diam nisl a egestas in proin euismod cum nullam platea quam vestibulum eget cras"
  },
  {
    "word": "nascetur",
    "definition": "integer faucibus in cras pretium auctor tellus enim egestas mi sed volutpat mollis facilisis tellus elementum augue et sit ullamcorper"
  },
  {
    "word": "ridiculus",
    "definition": "et at dolor bibendum quis ac viverra euismod cum porta vestibulum purus tempor vivamus magnis convallis sed felis felis eu"
  },
  {
    "word": "mus",
    "definition": "vitae purus leo lectus elementum et amet lectus quam sed eu amet nulla purus ac luctus felis nisl ornare quis"
  },
  {
    "word": "mauris",
    "definition": "sit nullam montes euismod viverra augue sit nisl ipsum eu ut et neque ornare sollicitudin pulvinar viverra turpis leo eu"
  },
  {
    "word": "ultricies",
    "definition": "facilisis viverra volutpat nunc feugiat volutpat justo aliquam est mi non viverra nunc odio bibendum sit ultricies lectus id imperdiet"
  },
  {
    "word": "commodo",
    "definition": "quam ultrices sed ornare sem purus in dis lorem neque venenatis mi congue neque non facilisis ultrices at malesuada varius"
  },
  {
    "word": "maecenas",
    "definition": "sit lectus diam est ipsum tincidunt viverra cursus quam nulla dignissim eu aliquet quam lobortis tincidunt ut sit pharetra pulvinar"
  },
  {
    "word": "odio",
    "definition": "aliquet eu proin ultrices tempor faucibus diam ornare ipsum consectetur nunc risus velit arcu malesuada mattis risus ullamcorper ornare malesuada"
  },
  {
    "word": "suscipit",
    "definition": "dictum consequat tellus enim egestas posuere nisl leo varius ut ut varius tellus suscipit in laoreet at commodo ut ut"
  },
  {
    "word": "adipiscing",
    "definition": "scelerisque orci eget lorem in et ornare tortor dui eu eu ornare massa lectus proin nisl sed nam arcu sed"
  },
  {
    "word": "ligula",
    "definition": "cum euismod nulla tincidunt pulvinar eu tempor diam nunc gravida semper ultricies ut amet ut lorem vitae faucibus mattis ultricies"
  },
  {
    "word": "luctus",
    "definition": "lectus ut aenean sagittis lectus ut nullam felis eget sit duis varius libero nulla fusce proin id vel nulla diam"
  },
  {
    "word": "posuere",
    "definition": "pretium sagittis arcu pellentesque euismod neque rhoncus nullam egestas bibendum aliquam lacus bibendum at nullam lacus aliquam arcu est imperdiet"
  },
  {
    "word": "justo",
    "definition": "feugiat mi platea sapien tortor lacus arcu tortor varius gravida sapien orci tortor aliquet eget metus enim ornare nisl amet"
  },
  {
    "word": "aenean",
    "definition": "fusce bibendum cras lorem arcu sit enim elit porttitor faucibus risus sed viverra sit cras sem nunc vel nunc etiam"
  },
  {
    "word": "eleifend",
    "definition": "mi odio euismod dictum in non aliquet aenean cras egestas nec viverra massa elementum sit mi duis montes in platea"
  },
  {
    "word": "urna",
    "definition": "mi orci faucibus parturient neque ultrices tincidunt vel mauris lobortis amet porttitor sed sociis vivamus vestibulum quis sit adipiscing nec"
  },
  {
    "word": "congue",
    "definition": "nibh sed suscipit ultrices est id eget tempor nisl convallis integer id suspendisse lobortis amet sollicitudin faucibus vulputate facilisis turpis"
  },
  {
    "word": "quisque",
    "definition": "eget mattis malesuada diam elementum posuere nunc justo ultricies ullamcorper faucibus ornare velit id at nam dui pharetra vel nunc"
  }
];
/* tslint:enable */

ReactDOM.render(
  <GlossarySidebar
    definitions={bigGlossary}
    learnerDefinitions={{morbi: ["diam elementum posuere nunc"], justo: ["rhoncus nullam egestas bibendum"]}}
  />,
  document.getElementById("sidebar-big") as HTMLElement
);
