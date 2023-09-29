/*
Copyright 2022-2023 Jean-François Vaduret

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var currentBrowser;
if (typeof chrome === 'undefined') {
  currentBrowser = browser;
} else {
  currentBrowser = chrome;
}

var fractionMap = [
  [/(\d*)\s+\xBD/g, 0.5],
  [/(\d*)\s+\xBC/g, 0.25],
  [/(\d*)\s+\xBE/g, 0.75]
];

var regexDict = [
  [
    parseAndChangeZone,
    [
      [/((?:\d+,)*\d+(?:.\d+)?)(\s*(?:by|to|and)\s*)((?:\d+,)*\d+(?:.\d+)?) ft\.?/g, " m."],
      [/((?:\d+,)*\d+(?:.\d+)?)(\s*(?:by|to|and)\s*)((?:\d+,)*\d+(?:.\d+)?) feet/g, " meters"],
      [/((?:\d+,)*\d+(?:.\d+)?)(\/)((?:\d+,)*\d+(?:.\d+)?)\)/g, " m.)"]
    ],
    [30, 100]
  ],
  [
    parseAndChangeZone,
    [
      [/((?:\d+,)*\d+(?:.\d+)?)(\s*(?:by|to|and)\s*)((?:\d+,)*\d+(?:.\d+)?) miles/g, " kilometers"]
    ],
    [150, 100]
  ],
  [
    parseAndChangeUnit,
    [
      [/(?:\d+,)*\d+(?:.\d+)? ft\.?/g, " m."],
      [/(?:\d+,)*\d+(?:.\d+)? feet/g, " meter"],
      [/(?:\d+,)*\d+(?:.\d+)? foot/g, " meter"],
      [/(?:\d+,)*\d+(?:.\d+)?-\s*foot/g, "-meter"]
    ],
    [30, 100]
  ],
  [
    parseAndChangeUnit,
    [
      [/(?:\d+,)*\d+(?:.\d+)? miles?/g, " kilometer"],
      [/(?:\d+,)*\d+(?:.\d+)?-\s*mile/g, "-kilometer"],
      [/(?:\d+,)*\d+(?:.\d+)? or more miles/g, " or more kilometer"],
      [/(?:\d+,)*\d+(?:.\d+)? mph/g, " km/h"]
    ],
    [150, 100]
  ],
  [
    parseAndChangeUnit,
    [
      [/(?:\d+,)*\d+(?:.\d+)? in\.?/g, " cm."],
      [/(?:\d+,)*\d+(?:.\d+)? inch(?:es)?/g, " centimeter"],
      [/(?:\d+,)*\d+(?:.\d+)?-\s*inch(?:es)?/g, "-centimeter"]
    ],
    [250, 100]
  ],
  [
    parseAndChangeUnit,
    [
      [/(?:\d+,)*\d+(?:.\d+)? cubic foot/g, " cubic meter"],
      [/(?:\d+,)*\d+(?:.\d+)? cubic feet/g, " cubic meter"]
    ],
    [30, 1000]
  ],
  [
    parseAndChangeUnit,
    [
      [/(?:\d+,)*\d+(?:.\d+)? sq\. yd\./g, " square meter"]
    ],
    [1, 1]
  ],
  [
    parseAndChangeUnit,
    [
      [/(?:\d+,)*\d+(?:.\d+)? lb\.?/g, " kg."],
      [/(?:\d+,)*\d+(?:.\d+)? pounds?/g, " kilogram"],
      [/(?:\d+,)*\d+(?:.\d+)?-\s*pounds?/g, "-kilogram"],
      [/(?:\d+,)*\d+(?:.\d+)? pints?/g, " liter"]
    ],
    [1000, 2000]
  ],
  [
    parseAndChangeUnit,
    [
      [/(?:\d+,)*\d+(?:.\d+)? ounces?/g, " gram"],
      [/(?:\d+,)*\d+(?:.\d+)?-ounces?/g, "-gram"]
    ],
    [300, 10]
  ],
  [
    parseAndChangeUnit,
    [
      [/(?:\d+,)*\d+(?:.\d+)? gallons?/g, " liter"],
      [/(?:\d+,)*\d+(?:.\d+)?-gallons?/g, "-liter"]
    ],
    [700, 200]
  ]
];

function changeToMeters_One(element) {
  if (element.classList.contains("ddbc-combat-attack__range-value-long")) {
    element.textContent = "(" + (parseFloat(element.textContent.match(/\d+/)) * 30) / 100 + ")";
  } else {
    element.textContent = (parseFloat(element.textContent) * 30) / 100;
  }
}

function changeToMeters() {
  var distancesNumber, distancesUnit, numberOfDistances;

  if (document.querySelector(".ddbc-distance-number")) {
    distancesNumber = document.querySelectorAll(".ddbc-distance-number__number");
    distancesUnit = document.querySelectorAll(".ddbc-distance-number__label");
    numberOfDistances = distancesNumber.length;

    for (var i = 0; i < numberOfDistances; i++) {
      if (distancesUnit[i].textContent == 'ft.') {
        if (distancesNumber[i].textContent != "--") {
          changeToMeters_One(distancesNumber[i]);
        }
        distancesUnit[i].textContent = 'm.';
      }
    }
  }
  if (document.querySelector(".ddbc-combat-attack__range-value-close")) {
    distancesNumber = document.querySelectorAll(".ddbc-combat-attack__range-value-close");
    distancesUnit = document.querySelectorAll(".ddbc-combat-attack__range-value-long");
    numberOfDistances = distancesNumber.length;

    for (var i = 0; i < numberOfDistances; i++) {
      if (!distancesNumber[i].classList.contains("converted")) {
        changeToMeters_One(distancesNumber[i]);
        changeToMeters_One(distancesUnit[i]);
        distancesNumber[i].classList.add("converted");
      }
    }
  }
  changeItemRange();
}

function changeItemRange() {
  if (document.querySelector(".ddbc-note-components__component")) {
    var regexItem = /\((\d+)\/(\d+)\)/g;
    var itemRange = document.querySelectorAll(".ddbc-note-components__component");
    var text, firstNumber, secondNumber;
    itemRange.forEach((element) => {
      if (!element.classList.contains("converted")) {
        text = element.textContent;
        var matches = [...text.matchAll(regexItem)];
        if (matches.length != 0) {
          matches.forEach((match) => {
            firstNumber = (parseFloat(match[1]) * 30) / 100;
            secondNumber = (parseFloat(match[2]) * 30) / 100;
            text = text.replace(regexItem, "(" + firstNumber + "/" + secondNumber + ")");
          });
          element.textContent = text;
          element.classList.add("converted");
        }
      }
    });
  }
}

function changeToKilograms_One(elementNumber, elementUnit) {
  elementNumber.textContent = (parseFloat(elementNumber.textContent) * 1000) / 2000;
  elementUnit.textContent = "kg.";
}

function changeToKilograms() {

  if (document.querySelector(".ddbc-weight-number")) {
    var weightNumber = document.querySelectorAll(".ddbc-weight-number__number");
    var weightUnit = document.querySelectorAll(".ddbc-weight-number__label");
    weightNumber.forEach((element, index) => {
      if (weightUnit[index].textContent == 'lb.') {
        changeToKilograms_One(element, weightUnit[index]);
      }
    });
  }

  if (document.querySelector(".ct-equipment__container-weight-capacity")) {
    weightContainerCapacity = document.querySelectorAll(".ct-equipment__container-weight-capacity");
    var regexWeightContainerCapacity = /\((\d+)\/(\d+) lb\.?\)/g;
    var text, matches, firstNumber, secondNumber;
    weightContainerCapacity.forEach((element) => {
      text = element.textContent;
      matches = [...text.matchAll(regexWeightContainerCapacity)];
      if (matches.length != 0) {
        matches.forEach((match) => {
          firstNumber = (parseFloat(match[1]) * 1000) / 2000;
          secondNumber = (parseFloat(match[2]) * 1000) / 2000;
          text = text.replace(match[0], "(" + firstNumber + "/" + secondNumber + " kg.)");
        });
        element.textContent = text;
      }
    });
  }
}

function changeInText(divList) {
  var currDiv;
  for (let i = 0; i < divList.length; i++) {
    currDiv = document.querySelectorAll(divList[i]);
    if (!currDiv)
      continue;
    for (let j = 0; j < currDiv.length; j++) {
      if (currDiv[j].classList.contains("checked"))
        continue;
      parseAndChangeInText(currDiv[j]);
      currDiv[j].classList.add("checked");
    }
  }
}

function parseAndChangeInText(element) {
  parseAndChangeFraction(element);
  parseAndChangeFractionSymbol(element);
  regexDict.forEach((parsePackage) => {
    parsePackage[0](element, parsePackage[1], parsePackage[2]);
  });
}

function parseAndChangeZone(element, regex, rate) {
  var text = element.textContent;
  var matches, firstNumber, secondNumber, reg;
  regex.forEach((regexElement) => {
    reg = new RegExp();
    matches = [...text.matchAll(regexElement[0])];
    if (matches.length != 0) {
      matches.forEach((match) => {
        firstNumber = (parseFloat(match[1].replace(",", "")) * rate[0]) / rate[1];
        secondNumber = (parseFloat(match[3].replace(",", "")) * rate[0]) / rate[1];
        text = text.replace(match[0], firstNumber + match[2] + secondNumber + regexElement[1]);
      });
      element.textContent = text;
    }
  });
}

function parseAndChangeUnit(element, regex, rate) {
  var text = element.textContent;
  var matches, number, unit;
  regex.forEach((regexElement) => {
    matches = [...text.matchAll(regexElement[0])];
    if (matches.length != 0) {
      matches.forEach((match) => {
        unit = regexElement[1];
        number = (parseFloat(match[0].replace(",", "")) * rate[0]) / rate[1];
        if (number != 1 && !(/(?:\/|\.$)/.test(unit)))
          unit += "s";
        text = text.replace(match[0], number + unit);
      });
      element.textContent = text;
    }
  });
}

function parseAndChangeFraction(element) {
  var text = element.textContent;
  var matches = [...text.matchAll(/(\d+)\/(\d+)([^\)]\s*(?:lb|pounds?|pints?|gallons?|ft|feet|foot|cubic|square|miles?|in\.|inch(?:es)?))/g)];
  if (matches.length != 0) {
    matches.forEach((match) => {
      text = text.replace(match[0], (((parseFloat(match[1]) * 100) / parseFloat(match[2])) / 100) + match[3]);
    });
    element.textContent = text;
  }
}

function parseAndChangeFractionSymbol(element) {
  var text = element.textContent;
  var matches, mainNumber;
  fractionMap.forEach((fractionSymbol) => {
    matches = [...text.matchAll(fractionSymbol[0])];
    if (matches.length != 0) {
      matches.forEach((match) => {
        mainNumber = parseFloat(match[1]) + fractionSymbol[1];
        text = text.replace(match[0], mainNumber);
      });
      element.textContent = text;
    }
  });
}

function changeInMonsterPage() {
  const monsterPageDivs = [
    ".mon-stat-block p",
    ".mon-details__description-block p",
    '.mon-stat-block span[class$="-data"]'
  ];
  changeInText(monsterPageDivs);
}

function changeInOtherPage() {
  const otherPageDivs = [
    ".ddb-statblock-item-value",
    ".more-info-content p",
    ".more-info-content li",
    ".p-article-content p",
    ".table-compendium td"
  ];
  changeInText(otherPageDivs);
}

function changeInCharacterPage() {
  const characterPageDivs = [
    ".ct-senses__summary",
    ".jsx-parser p",
    ".ddbc-html-content p",
    ".ddbc-html-content li",
    ".ct-sidebar__pane p",
    '.ct-sidebar__pane .ddbc-creature-block span[class$="-data"]',
    ".ddbc-item-name",
    ".ct-preferences-pane__field-description"
  ];
  changeToMeters();
  changeToKilograms();
  changeInText(characterPageDivs);
}

function observeWhenReady() {
  var observedNode = document.querySelector("body");
  if (!observedNode) {
    window.setTimeout(addObserverIfDesiredNodeAvailable, 500);
    return;
  }
  var url = window.location.href;
  if (url.match(/characters\//g)) {
    const observer = new MutationObserver(changeInCharacterPage);
    observer.observe(observedNode, { childList: true, subtree: true });
  } else if (url.match(/monsters\//g)) {
    changeInMonsterPage();
  } else {
    changeInOtherPage();
  }

}

function loadPreferencesAndRun(result) {
  if (result.state == "disabled") {
    console.log("Metric Beyond is disabled");
  }
  else {
    observeWhenReady();
  }
}

function onError(error) {
  console.log(`Error: ${error}`);
}

const getting = currentBrowser.storage.local.get("state");
getting.then(loadPreferencesAndRun, onError);
