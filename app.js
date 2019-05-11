let winCombos = [
    {id: 'CCCT', text: '3 CHERRY symbols on top line', win: 2000},
    {id: 'CCCC', text: '3 CHERRY symbols on center line', win: 1000},
    {id: 'CCCB', text: '3 CHERRY symbols on bottom line', win: 4000},
    {id: '777', text: '3 7 symbols on any line', win: 150},
    {id: 'AC7', text: 'Any combination of CHERRY and 7 on any line', win: 75},
    {id: '333', text: '3 3xBAR symbols on any line', win: 50},
    {id: '222', text: '3 2xBAR symbols on any line', win: 20},
    {id: 'BBB', text: '3 BAR symbols on any line', win: 10},
    {id: 'AB23', text: 'Combination of any BAR symbols on any line', win: 5}
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
Ring.prototype.createFace = function (index) {
    let currentFaceId = 'face' + this.id + '-' + index;
    let degree = index * 47 - 47 - 23;

    let img = $('<img class="img-responsive" src="" alt="">').attr('src', this.images[index]),
        div = $('<div class="poster" >').attr('id', currentFaceId)
            .css({transform: 'rotateX(' + (degree) + 'deg) translateZ(140px)'});

    this.el.append(div.append(img));
    this.faces.push({el: $('#' + currentFaceId), deg: degree, imgIndex: index, facePos: index});
};
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
                console.log("hey");
                face.deg -= 3 * 47;
                face.imgIndex = (5 + face.imgIndex - 3) % 5;
                face.el.children(":first").attr("src", "img/" + _this.images[face.imgIndex]);
            }
            face.el.css("transform", "rotateX(" + ++face.deg + "deg) translateZ(140px)");
        });


        let firstFace = _this.faces[_this.middle];

        let faceMatch = firstFace.imgIndex === stopFace;
        let timeMatch = Date.now() - startTime > duration;

        if (faceMatch && timeMatch) {
            [-1, 0, 1].forEach(function (el, ind) {
                let virtualPos = (3 + _this.middle + el) % 3;
                _this.faces[virtualPos].deg = stopPositions[stopPos] + ind * 47;
                _this.faces[virtualPos].el.css("transform", "rotateX(" + _this.faces[virtualPos].deg + "deg) translateZ(140px)");

            });
            _this.el.children().removeClass('motion-blur');
            callback();
        } else {
            requestAnimationFrame(innerLoop);
        }
    }

    innerLoop();

};

let PayTable = function () {
    this.selector = $('#pay-table');
    let _this = this;
    winCombos.forEach(function (item) {
        let $payItem = $('<div class="pay-item">')
            .append([
                $('<span class="text">').text(item.text),
                $('<span class="amount">').text(item.win)
            ]);

        _this.selector.append($payItem);
    });
};

let Slots = function () {
    this.balance = 20;
    this.$balance = $('#balance');

};

$(document).ready(function () {

    let $rotate = $('#rotate');
    let payTable = new PayTable();
    let control = [];

    for (let i = 0; i < 3; i++) {
        let currentRing = new Ring($rotate, i);
        control.push(currentRing);
    }

    function generatePosition() {
        let positionRandom = Math.floor(3 * Math.random());
        let symbolRandom = Math.floor(5 * Math.random());
        return {face: symbolRandom, position: positionRandom};
    }

    control.forEach(function (ring, ind) {
        let position = generatePosition();
        ring.spin(16, 2000 + 500 * ind, position.position, position.face, function () {
            console.log("yay");
        });
    });


});
