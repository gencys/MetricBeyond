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

function changeToMeters_One(element) {
    if (element.classList.contains("ddbc-combat-attack__range-value-long")) {
        element.textContent = "(" + (parseFloat(element.textContent.match(/\d+/)) * 30)/100 + ")";
    } else {
        element.textContent = (parseFloat(element.textContent) * 30)/100;
    }
}

function changeToMeters() {
    var distancesNumber, distancesUnit, numberOfDistances;
    
    if (document.querySelector(".ddbc-distance-number")) {
        distancesNumber = document.querySelectorAll(".ddbc-distance-number__number");
        distancesUnit = document.querySelectorAll(".ddbc-distance-number__label");
        numberOfDistances = distancesNumber.length;
        
        for (var i = 0; i < numberOfDistances; i++){
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
        
        for (var i = 0; i < numberOfDistances; i++){
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
    if (document.querySelector(".ddbc-note-components__component")){
        var regexItem = /\((\d+)\/(\d+)\)/g;
        var itemRange = document.querySelectorAll(".ddbc-note-components__component");
        var text, firstNumber, secondNumber;
        itemRange.forEach( (element) => {
            if(!element.classList.contains("converted")) {
                text = element.textContent;
                var matches = [...text.matchAll(regexItem)];
                if (matches.length != 0) {
                    matches.forEach( (match) => {
                        firstNumber = (parseFloat(match[1])*30)/100;
                        secondNumber = (parseFloat(match[2])*30)/100;
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
    elementNumber.textContent = (parseFloat(elementNumber.textContent) * 1000 ) / 2000;
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
        var regexWeightContainerCapacity = /\((\d+)\/(\d+) lb\)/g;
        var text, matches, firstNumber, secondNumber;
        weightContainerCapacity.forEach((element) => {
            text = element.textContent;
            matches = [...text.matchAll(regexWeightContainerCapacity)];
            if (matches.length != 0) {
                matches.forEach((match) => {
                    firstNumber = (parseFloat(match[1]) *1000)/ 2000;
                    secondNumber = (parseFloat(match[2]) *1000)/ 2000;
                    text = text.replace(regexWeightContainerCapacity, "(" + firstNumber  + "/" + secondNumber + " kg)");
                });
                element.textContent = text;
            }
            
        });
    }
}

function changeInText(divList) {
    var currDiv;
    divList.forEach( (divSelector) => {
        currDiv = document.querySelectorAll(divSelector);
        if ( currDiv ) {
            currDiv.forEach( (element) => {
                if (!element.classList.contains("checked")) {
                    parseAndChangeInText(element);
                    element.classList.add("checked");
                }
            });
        }
    });
}

function parseAndChangeInText(element) {
    var regexDict = [
        [
            parseAndChangeZone,
            [
                [/(\d+) by (\d+) ft./g, /(\d+) by (\d+) ft./, [" by ", " m."]]
            ],
            [30, 100]
        ],
        [
            parseAndChangeZone,
            [
                [/(\d+) by (\d+) miles/g, /(\d+) by (\d+) miles/, [" by ", " kilometers"]],
                [/(\d+) to (\d+) miles/g, /(\d+) to (\d+) miles/, [" to ", " kilometers"]]
            ],
            [150, 100]
        ],
        [
            parseAndChangeUnit,
            [
                [/\d+ ft\.?/g, /\d+ ft\.?/, " m."],
                [/\d+ feet/g, /\d+ feet/, " meters"],
                [/\d+ foot/g, /\d+ foot/, " meters"],
                [/\d+-\s*foot/g, /\d+-\s*foot/, "-meters"]
            ],
            [30, 100]
        ],
        [
            parseAndChangeUnit,
            [
                [/\d+ miles/g, /\d+ miles/, " kilometers"],
                [/\d+ mile/g, /\d+ mile/, " kilometers"],
                [/\d+-\s*mile/g, /\d+-\s*mile/, "-kilometers"],
                [/\d+ or more miles/g, /\d+ or more miles/, " or more kilometers"]
            ],
            [150, 100]
        ],
        [
            parseAndChangeUnit,
            [
                [/\d+ in\.?/g, /\d+ in\.?/, " cm."],
                [/\d+ inches/g, /\d+ inches/, " centimeters"],
                [/\d+ inch/g, /\d+ inch/, " centimeters"],
                [/\d+-\s*inch/g, /\d+-\s*inch/, "-centimeters"]
            ],
            [250, 100]
        ],
        [
            parseAndChangeUnit,
            [
                [/\d+ cubic foot/g, /\d+ cubic foot/, " cubic meters"],
                [/\d+ cubic feet/g, /\d+ cubic feet/, " cubic meters"]
            ],
            [30, 1000]
        ],
        [
            parseAndChangeUnit,
            [
                [/\d+ lb\.?/g, /\d+ lb\.?/, " kg."],
                [/\d+ pounds/g, /\d+ pounds/, " kilograms"],
                [/\d+ pound/g, /\d+ pound/, " kilograms"],
                [/\d+-\s*pounds/g, /\d+-\s*pounds/, "-kilograms"]
            ],
            [1000, 2000]
        ]
    ];
    regexDict.forEach( (parsePackage) => {
        parsePackage[0](element, parsePackage[1], parsePackage[2]);
    });
}

function parseAndChangeZone(element, regex, rate) {
    var text = element.textContent;
    var matches, firstNumber, secondNumber;
    regex.forEach( (regexElement) => {
        matches = [...text.matchAll(regexElement[0])];
        if (matches.length != 0) {
            matches.forEach( (match) => {
                firstNumber = (parseFloat(match[1]) * rate[0])/rate[1];
                secondNumber = (parseFloat(match[2]) * rate[0])/rate[1];
                text = text.replace(regexElement[1], firstNumber + regexElement[2][0] + secondNumber + regexElement[2][1]);
            });
            element.textContent = text;
        }
    });
}

function parseAndChangeUnit(element, regex, rate) {
    var text = element.textContent;
    var matches;
    regex.forEach( (regexElement) => {
        matches = [...text.matchAll(regexElement[0])];
        if (matches.length != 0) {
            matches.forEach( (match) => {
                text = text.replace(regexElement[1], (parseFloat(match) * rate[0])/rate[1] + regexElement[2]);
            });
            element.textContent = text;
        }
    });
}

function changeInMonsterPage(){
    const monsterPageDivs = [
        ".mon-stat-block p",
        ".mon-details__description-block p",
        '.mon-stat-block span[class$="-data"]'
    ];
    changeInText(monsterPageDivs);
}

function changeInOtherPage(){
    const otherPageDivs = [
        ".ddb-statblock-item-value",
        ".more-info-content p",
        ".more-info-content li"
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
    if(!observedNode) {
        window.setTimeout(addObserverIfDesiredNodeAvailable,500);
        return;
    }
    var url = window.location.href;
    if (url.match(/characters\//g)) {
        const observer = new MutationObserver( changeInCharacterPage );
        observer.observe(observedNode,{childList: true, subtree: true});
    } else if (url.match(/monsters\//g)) {
        changeInMonsterPage();
    } else {
        changeInOtherPage();
    }
    
}

function loadPreferencesAndRun(result) {
    if (result.state == "disabled"){
        console.log("Metric Beyond is disabled");
    }
    else {
        observeWhenReady();
    }
}

function onError(error) {
  console.log(`Error: ${error}`);
}

const getting = browser.storage.local.get("state");
getting.then(loadPreferencesAndRun, onError);
