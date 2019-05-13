/**
 * Symbols:
 * C - Cherry
 * 7 - Seven
 * 3 - 3xBAR
 * 2 - 2xBAR
 * B - BAR
 *
 * Lines:
 * T - Top
 * M - Middle
 * B - Bottom
 */
let winCombos = [
    {id: 'CCCT', text: '3 CHERRY symbols on top line', win: 2000, symbols: 'C', lines: 'T'},
    {id: 'CCCC', text: '3 CHERRY symbols on center line', win: 1000, symbols: 'C', lines: 'M'},
    {id: 'CCCB', text: '3 CHERRY symbols on bottom line', win: 4000, symbols: 'C', lines: 'B'},
    {id: '777', text: '3 7 symbols on any line', win: 150, symbols: '7', lines: 'TMB'},
    {id: 'AC7', text: 'Any combination of CHERRY and 7 on any line', win: 75, symbols: 'C7', lines: 'TMB'},
    {id: '333', text: '3 3xBAR symbols on any line', win: 50, symbols: '3', lines: 'TMB'},
    {id: '222', text: '3 2xBAR symbols on any line', win: 20, symbols: '2', lines: 'TMB'},
    {id: 'BBB', text: '3 BAR symbols on any line', win: 10, symbols: 'B', lines: 'TMB'},
    {id: 'AB23', text: 'Combination of any BAR symbols on any line', win: 5, symbols: '32B', lines: 'TMB'}
];

let Ring = function ($parent, number) {
    this.images = [
        '3xBAR.png',
        'BAR.png',
        '2xBAR.png',
        '7.png',
        'Cherry.png'
    ];
    this.id = 'ring-' + number;
    $parent.append('<div class="ring" id="' + this.id + '"></div>');
    this.selector = '#' + this.id;
    this.el = $(this.selector);
    this.faces = [];
    for (let i = 0; i < 3; i++) {
        this.createFace(i);
    }
    this.middle = 1;
};

/**
 * created reel face with initial symbol
 * @param index
 */
Ring.prototype.createFace = function (index) {
    let currentFaceId = 'face' + this.id + '-' + index;
    let degree = index * 47 - 47 - 23;
    let img = $('<img class="img-responsive" src="" alt="">')
            .attr('src', "img/" + this.images[(5 - index) % 5]),
        div = $('<div class="poster" >').attr('id', currentFaceId)
            .css({transform: 'rotateX(' + (degree) + 'deg) translateZ(140px)'});
    div.append(img);


    this.el.append(div);
    this.faces.push({el: $('#' + currentFaceId), deg: degree, imgIndex: (5 - index) % 5, facePos: index});
};

/**
 * animates spinning of reel using given parameters and triggers callback when finishes
 * @param speed
 * @param duration
 * @param stopPos
 * @param stopFace
 * @param callback
 */
Ring.prototype.spin = function (speed, duration, stopPos, stopFace, callback) {

    let stopPositions = [-24, -47, -70];
    let startTime = Date.now();
    let _this = this;

    this.el.children().addClass('motion-blur');

    function innerLoop() {
        _this.faces.forEach((face, index) => {
            face.deg = (face.deg + speed) % 360;
            if (face.deg > 60) {
                _this.middle = (3 + index - 2) % 3;
                face.deg -= 3 * 47;
                face.imgIndex = (face.imgIndex + 3) % 5;
                face.el.children(":first").attr("src", "img/" + _this.images[face.imgIndex]);
            }
            face.el.css("transform", "rotateX(" + ++face.deg + "deg) translateZ(140px)");
        });


        let firstFace = _this.faces[_this.middle];

        let faceMatch = firstFace.imgIndex === stopFace;
        let timeMatch = Date.now() - startTime > duration;

        if (faceMatch && timeMatch) {
            [-1, 0, 1].forEach(function (el, ind) {
                let virtualPos = (3 + _this.middle + el) % 3; // actual position in array based on real position
                _this.faces[virtualPos].deg = stopPositions[stopPos] + ind * 47;
                _this.faces[virtualPos].el.css("transform", "rotateX(" + _this.faces[virtualPos].deg + "deg) translateZ(140px)");

            });
            _this.el.children().removeClass('motion-blur');
            callback();
        } else {
            requestAnimationFrame(innerLoop); // for optimal framerate
        }
    }

    innerLoop();

};

let PayTable = function () {
    this.selector = $('#pay-table');
    let _this = this;
    winCombos.forEach(function (item) {
        let $payItem = $('<div class="pay-item" id="win-' + item.id + '">')
            .append([
                $('<span class="text">').text(item.text),
                $('<span class="amount">').text(item.win)
            ]);

        _this.selector.append($payItem);
    });
};
/**
 * helper for applying blink on one item
 * @param winId
 */
PayTable.prototype.blinkOne = function (winId) {
    $('#win-' + winId).addClass('active');
};

/**
 * helper for clearing blink efect
 */
PayTable.prototype.clearBlink = function () {
    $('.pay-item').removeClass('active');
};

/**
 * Starting point for the game
 * @constructor
 */
let Slots = function () {
    this.balance = 20;
    this.$balance = $('#balance');
    this.$spin = $('#spin');
    this.$setBalance = $('#set-balance');
    this.$balanceInput = $('#balance-input');
    this.$rotate = $('#rotate');
    this.currentPositions = [];
    this.control = [];
    let payTable = new PayTable();

    let _this = this;

    this.$setBalance.on('click', function () {
        _this.setBalance(parseInt(_this.$balanceInput.val()));
    });


    for (let i = 0; i < 3; i++) {
        let currentRing = new Ring(this.$rotate, i);
        this.control.push(currentRing);
    }

    this.$spin.on("click", function () {
        _this.$setBalance.prop("disabled", true);
        _this.clearPositionLines();
        payTable.clearBlink();
        _this.deductFromBalance(1);
        _this.$spin.prop("disabled", true);

        _this.currentPositions = [];
        let $debug = $("#debug");
        let callTimes = 0;


        if ($debug.is(":checked")) {
            _this.control.forEach(function (ring, ind) {
                let position = {
                    face: parseInt($("#symbol-" + (ind + 1)).val()),
                    position: parseInt($("#pos-" + (ind + 1)).val())
                };
                _this.currentPositions.push(position);
                ring.spin(16, 2000 + 500 * ind, position.position, position.face, spinCallback);
            });
        } else {
            _this.control.forEach(function (ring, ind) {
                let position = _this.generatePosition();
                _this.currentPositions.push(position);
                ring.spin(16, 2000 + 500 * ind, position.position, position.face, spinCallback);
            });
        }

        function spinCallback() {
            callTimes++;
            if (callTimes === 3) {
                let wins = _this.calculateWinningCombinations();
                wins.forEach(function (win) {
                    _this.crossPositionLine(win.line);
                    payTable.blinkOne(win.combo.id);
                });
                let win = _this.countWinningSum(wins);
                _this.addToBalance(win);
                _this.$setBalance.prop("disabled", false);
            }
        }
    });

};

Slots.prototype.faceSymbols = ["3", "B", "2", "7", "C"]; //for converting indexes into symbols
Slots.prototype.lineSymbols = ["T", "M", "B"]; // for converting indexes into line symbols

/**
 * Generates random position for single reel
 * @returns {{face: number, position: number}}
 */
Slots.prototype.generatePosition = function () {
    let positionRandom = Math.floor(3 * Math.random());
    let symbolRandom = Math.floor(5 * Math.random());
    return {face: symbolRandom, position: positionRandom};
};

/**
 * returns all winning combinations with corresponding lines
 * @returns {T[]|*|Array|Array}
 */
Slots.prototype.calculateWinningCombinations = function () {
    let middleCount = 0;
    for (let i = 0; i < this.currentPositions.length; i++) {
        if (this.currentPositions[i].position % 2 === 1) {
            middleCount++
        }
    }
    // when middle count isn't equal to 3 or 0, means, that we don't have all of the on same line
    if (middleCount % 3 !== 0) {
        return [];
    }
    if (middleCount === 0) { // this means, we have combination on top and bottom lines.
        return this.checkLineCombination(0)
            .concat(this.checkLineCombination(2));
    }

    return this.checkLineCombination(1);
};

/**
 * calculates total win amount based on winning combinations
 * @param winningCombinations
 * @returns {*}
 */
Slots.prototype.countWinningSum = function (winningCombinations) {
    return winningCombinations.reduce(function (acc, current) {
        return acc + current.combo.win;
    }, 0);
};

/**
 * returns best winning combination for given line
 * @param line
 * @returns {{line: *, combo: *}[]|Array}
 */
Slots.prototype.checkLineCombination = function (line) {
    let combination = [];
    for (let i = 0; i < this.currentPositions.length; i++) {
        let currentFace = this.currentPositions[i].face;
        if (this.currentPositions[i].position > line) {
            currentFace = (5 + currentFace - 1) % 5;
        } else if (this.currentPositions[i].position < line) {
            currentFace = (currentFace + 1) % 5;
        }
        combination.push(this.getSymbolByNumber(currentFace));
    }
    let lineSymbol = this.getLineSymbol(line);
    let matchingCombos = winCombos.filter(function (winCombo) {
        let lineMatch = winCombo.lines.indexOf(lineSymbol) !== -1;
        let combinationMatch = true;
        combination.forEach(function (symbol) {
            if (combinationMatch) {
                combinationMatch = winCombo.symbols.indexOf(symbol) !== -1;
            }
        });
        return lineMatch && combinationMatch;
    });
    if (matchingCombos.length > 0) {
        return [{line: line, combo: matchingCombos[0]}];
    }
    return [];
};

Slots.prototype.getSymbolByNumber = function (number) {
    return this.faceSymbols[number];
};

Slots.prototype.getLineSymbol = function (number) {
    return this.lineSymbols[number];
};

Slots.prototype.addToBalance = function (amount) {
    this.balance += amount;
    this.$balance.text('' + this.balance);
    this.resetSpinButtion();
};

Slots.prototype.deductFromBalance = function (amount) {
    this.balance -= amount;
    this.$balance.text('' + this.balance);
    this.resetSpinButtion();
};

Slots.prototype.setBalance = function (amount) {
    this.balance = amount;
    this.$balance.text('' + this.balance);
    this.resetSpinButtion();
};

/**
 * helper for manipulating button state (disabled/enabled)
 */
Slots.prototype.resetSpinButtion = function () {
    if (this.balance > 0) {
        $("#spin").prop("disabled", false);
    } else {
        $("#spin").prop("disabled", true);
    }
};

/**
 * helper for showing crossing line (appear)
 * @param line
 */
Slots.prototype.crossPositionLine = function (line) {
    let lineNames = ['top', 'middle', 'bottom'];
    $('#cross-' + lineNames[line]).css({opacity: 1});
};

/**
 * helper for disappearing all lines
 */
Slots.prototype.clearPositionLines = function () {
    $('.cross').css({opacity: 0});
};

/**
 * helper which limits user input strictly under given range
 */
function setUpDebugInputs() {
    $("#balance-input").on("input", function () {
        let max = parseInt($(this).attr('max'));
        let min = parseInt($(this).attr('min'));
        if ($(this).val() > max) {
            $(this).val(max);
        } else if ($(this).val() < min) {
            $(this).val(min);
        }
    });
}


$(document).ready(function () {

    setUpDebugInputs();

    (new Slots());

});
