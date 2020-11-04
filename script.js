// alert('Привет, будьте добры проверить ближе к выходным пожалуйста!Времени не было поэтому приходится делать таск на этой неделе')

const Keyboard = {
  elements: {
    main: null,
    keysContainer: null,
    keys: []
  },

  eventHandlers: {
    oninput: null,
    onclose: null
  },

  keyLayout: {
    ru: [
      "ё", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
      "й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ", "ArrowLeft", "ArrowRight",
      "caps", "ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э", "enter",
      "done", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю", ",", ".", "?",
      "space", "lang",
    ],
    en: [
      "`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
      "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
      "caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", "enter",
      "done", "z", "x", "c", "v", "b", "n", "m", ",", ".", "?", "ArrowLeft", "ArrowRight",
      "space", "lang",
    ]
  },

  properties: {
    value: "",
    capsLock: false,
    lang: 'ru',
  },

  init() {
    // Create main elements
    this.elements.main = document.createElement("div");
    this.elements.keysContainer = document.createElement("div");
    // Setup main elements
    this.elements.main.classList.add("keyboard", "keyboard--hidden");
    this.elements.keysContainer.classList.add("keyboard__keys");
    this.elements.keysContainer.appendChild(this._createKeys());

    this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

    // Add to DOM
    this.elements.main.appendChild(this.elements.keysContainer);
    document.body.appendChild(this.elements.main);

    // Automatically use keyboard for elements with .use-keyboard-input
    document.querySelectorAll(".use-keyboard-input").forEach(element => {
      element.addEventListener("focus", () => {
        this.open(element.value, currentValue => {
          element.value = currentValue;
        });
      });
    });
  },

  _createKeys() {
    const fragment = document.createDocumentFragment();
    const keyLayout = this.properties.lang === "en" ? this.keyLayout.en : this.keyLayout.ru;
    const field = document.querySelector(".use-keyboard-input");

    // Creates HTML for an icon
    const createIconHTML = (icon_name) => {
      return `<i class="material-icons">${icon_name}</i>`;
    };

    keyLayout.forEach(key => {
      const keyElement = document.createElement("button");
      const insertLineBreak = ["backspace", "p", "enter", "?", "lang"].indexOf(key) !== -1;

      // Add attributes/classes
      keyElement.setAttribute("type", "button");
      keyElement.classList.add("keyboard__key");
      if(key !== 'lang' && key !== 'done'){
        keyElement.addEventListener('mousedown', (e) => {
          document.querySelector(".use-keyboard-input").focus();
          e.preventDefault();
        });
      }

      document.addEventListener("keydown", (e) => {
        if(e.getModifierState('CapsLock') !== this.properties.capsLock){
          this._toggleCapsLock();
          document.querySelector('.keyboard__key--activatable').classList.toggle("keyboard__key--active");
        }
        if(e.key.toLowerCase() === key.toLowerCase()){
          keyElement.classList.add('active');
        }
      })

      document.addEventListener("keyup", (e) => {
        
        if(e.key.toLowerCase() === key.toLowerCase()){
          keyElement.classList.remove('active');
        }
      })

      switch (key) {
        case "backspace":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = createIconHTML("backspace");

          keyElement.addEventListener("click", () => {
            let str = field.value;
            let caret = getCaret(field);
            if(caret > 0){
              str = str.slice(0, caret - 1) + str.slice(caret, str.length);
              field.value = str;
              caret = caret - 1;
            }
            field.setSelectionRange(caret, caret);
          });

          break;

        case "caps":
          keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
          keyElement.innerHTML = createIconHTML("keyboard_capslock");

          keyElement.addEventListener("click", () => {
            this._toggleCapsLock();
            keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
          });

          break;

        case "enter":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = createIconHTML("keyboard_return");

          keyElement.addEventListener("click", () => {
            this.properties.value += "\n";
            this._triggerEvent("oninput");
          });

          break;

        case "space":
          keyElement.classList.add("keyboard__key--extra-wide");
          keyElement.innerHTML = createIconHTML("space_bar");

          keyElement.addEventListener("click", () => {
            this.properties.value += " ";
            this._triggerEvent("oninput");
          });

          break;

        case "done":
          keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
          keyElement.innerHTML = createIconHTML("check_circle");

          keyElement.addEventListener("click", () => {
            this.close();
            this._triggerEvent("onclose");
          });

          break;

        case "lang":
          keyElement.addEventListener("click", () => {
            this._toggleLang();
          });
          keyElement.innerText = this.properties.lang === "en" ? "ru" : "en";

          break;

        case "ArrowLeft":
          keyElement.innerHTML = "<";
          keyElement.addEventListener("click", () => {
            const field = document.querySelector(".use-keyboard-input");
            const caret = getCaret(field) - 1;
            field.setSelectionRange(caret, caret);
          });
          break;

        case "ArrowRight":
          keyElement.innerHTML = ">";
          keyElement.addEventListener("click", () => {
            const field = document.querySelector(".use-keyboard-input");
            const caret = getCaret(field) + 1;
            field.setSelectionRange(caret, caret);
          });
          break;
        
        default:
          keyElement.textContent = key.toLowerCase();
          keyElement.addEventListener("click", () => {
            this.properties.value += this.properties.capsLock ? key.toUpperCase() : key.toLowerCase();
            field.value = field.value + keyElement.textContent;
          });

          break;
      }

      fragment.appendChild(keyElement);

      if (insertLineBreak) {
        fragment.appendChild(document.createElement("br"));
      }
    });

    return fragment;
  },

  _toggleCapsLock() {
    this.properties.capsLock = !this.properties.capsLock;

    for (const key of this.elements.keys) {
      if (key.childElementCount === 0) {
        key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
      }
    }
  },

  _toggleLang() {
    this.properties.lang  = this.properties.lang === 'ru' ? 'en' : 'ru';
    document.body.removeChild(document.querySelector('.keyboard'))
    this.close();
    this.init();
    this.open();
  },

  open(initialValue, oninput, onclose) {
    this.properties.value = initialValue || "";
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.remove("keyboard--hidden");
  },

  close() {
    this.properties.value = "";
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.properties.capsLock = false;
    this.elements.main.classList.add("keyboard--hidden");
  }
};

window.addEventListener("DOMContentLoaded", function () {
  Keyboard.init();
});

function getCaret(field) {
  var iCaretPos = 0;
  if (document.selection) {
    var oSel = document.selection.createRange();

    oSel.moveStart('character', -field.value.length);
    iCaretPos = oSel.text.length;
  }
  else if (field.selectionStart || field.selectionStart == '0')
    iCaretPos = field.selectionDirection=='backward' ? field.selectionStart : field.selectionEnd;

  return iCaretPos;
}