// ===================== Пример кода первой двери =======================
/**
 * @class Door0
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door0(number, onUnlock) {
    DoorBase.apply(this, arguments);

    var buttons = [
        this.popup.querySelector('.door-riddle__button_0'),
        this.popup.querySelector('.door-riddle__button_1'),
        this.popup.querySelector('.door-riddle__button_2')
    ];

    buttons.forEach(function (b) {
        b.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
        b.addEventListener('pointerup', _onButtonPointerUp.bind(this));
        b.addEventListener('pointercancel', _onButtonPointerUp.bind(this));
        b.addEventListener('pointerleave', _onButtonPointerUp.bind(this));
    }.bind(this));

    function _onButtonPointerDown(e) {
        e.target.classList.add('door-riddle__button_pressed');
        checkCondition.apply(this);
    }

    function _onButtonPointerUp(e) {
        e.target.classList.remove('door-riddle__button_pressed');
    }

    /**
     * Проверяем, можно ли теперь открыть дверь
     */
    function checkCondition() {
        var isOpened = true;
        buttons.forEach(function (b) {
            if (!b.classList.contains('door-riddle__button_pressed')) {
                isOpened = false;
            }
        });

        // Если все три кнопки зажаты одновременно, то откроем эту дверь
        if (isOpened) {
            this.unlock();
        }
    }
}

// Наследуемся от класса DoorBase
Door0.prototype = Object.create(DoorBase.prototype);
Door0.prototype.constructor = DoorBase;
// END ===================== Пример кода первой двери =======================

/**
 * @class Door1
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door1(number, onUnlock) {
    DoorBase.apply(this, arguments);

    // ==== Напишите свой код для открытия второй двери здесь ====
    // Для примера дверь откроется просто по клику на неё
    var box = this.popup.querySelector('.box-2-container');
    var frameGuid;
    var primaryPointerId;

    box.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
    box.addEventListener('pointermove', _onMove.bind(this));
    box.addEventListener('pointerup', _onButtonPointerUp.bind(this));
    box.addEventListener('pointercancel', _onButtonPointerUp.bind(this));
    box.addEventListener('pointerleave', _onButtonPointerUp.bind(this));

    function _onButtonPointerDown(e) {
        if (!primaryPointerId) {
            // Останавливаем анимацию
            if (frameGuid) {
                cancelAnimationFrame(frameGuid);
                frameGuid = undefined;
            }
            primaryPointerId = {
                x: e.clientX,
                y: e.clientY,
                pointerType: e.pointerType,
                pointerId: e.pointerId
            };
            // Выставляем базовые координаты (относительно которых происходит трансформация
            box.setAttribute('init-x', box.getAttribute('x') || 0);
            box.setAttribute('init-y', box.getAttribute('y') || 0);
            box.setPointerCapture(e.pointerId);
        }
    }

    /**
     * Анимация возвращения блока в исходное положение
     * @param initX
     * @param initY
     * @param perX
     * @param perY
     */
    function toBasePosition(initX, initY, perX, perY) {
        var i = 1;

        function moving() {
            var xDiff = initX - i * perX;
            var yDiff = initY - i * perY;
            box.style.transform = 'translate(' + xDiff + 'px,' + yDiff + 'px)';
            box.setAttribute('x', xDiff);
            box.setAttribute('y', yDiff);
            i += 1;
            if (i >= 60 || !frameGuid) {
                cancelAnimationFrame(frameGuid);
                frameGuid = undefined;
            } else {
                requestAnimationFrame(moving);
            }
        }

        frameGuid = requestAnimationFrame(moving);
    }

    function _onButtonPointerUp(e) {
        if (primaryPointerId && primaryPointerId.pointerId === e.pointerId) {
            primaryPointerId = undefined;
            var initX = parseFloat(box.getAttribute('x'));
            var initY = parseFloat(box.getAttribute('y'));
            var perX = initX / 60;
            var perY = initY / 60;
            toBasePosition(initX, initY, perX, perY);
        }
    }

    function _onMove(e) {
        if (primaryPointerId && primaryPointerId.pointerId === e.pointerId) {
            var initX = parseFloat(box.getAttribute('init-x')) || 0;
            var initY = parseFloat(box.getAttribute('init-y')) || 0;
            // Высчитываем разницу для перемещения
            var xDiff = initX + (primaryPointerId.x - e.clientX) * -1;
            var yDiff = initY + (primaryPointerId.y - e.clientY) * -1;
            box.style.transform = 'translate(' + xDiff + 'px,' + yDiff + 'px)';
            box.setAttribute('x', xDiff);
            box.setAttribute('y', yDiff);
            // Если находится в топе по середине то квест выполнили
            if (xDiff > -10 && xDiff <= 10 && yDiff <= document.documentElement.clientHeight / -2) {
                this.unlock();
            }
        }
    }

}
Door1.prototype = Object.create(DoorBase.prototype);
Door1.prototype.constructor = DoorBase;

/**
 * @class Door2
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Door2(number, onUnlock) {
    DoorBase.apply(this, arguments);

    var pinInput = this.popup.querySelector('.answer');
    var block = this.popup.querySelector('.door-block');
    var formula = this.popup.querySelector('.formula');
    var pointers = {count: 0};
    var distance = 0; //расстояние между двумя поинтерами
    var baseDistance = undefined; //начальное расстояние между двумя поинтерами

    block.addEventListener('pointerdown', _onButtonPointerDown.bind(this));
    block.addEventListener('pointermove', _onMove.bind(this));
    block.addEventListener('pointerup', _onButtonPointerUp.bind(this));
    block.addEventListener('pointercancel', _onButtonPointerUp.bind(this));
    block.addEventListener('pointerleave', _onButtonPointerUp.bind(this));

    function _onButtonPointerDown(e) {
        pointers[e.pointerId] = {
            x: e.clientX,
            y: e.clientY,
            pointerType: e.pointerType,
            pointerId: e.pointerId
        };
        pointers.count += 1;
        baseDistance = undefined;
    }

    function _onButtonPointerUp(e) {
        if (pointers[e.pointerId]) {
            delete pointers[e.pointerId];
            pointers.count -= 1;
            baseDistance = undefined;
        }
    }

    function _onMove(e) {
        if (pointers.count === 2) {
            var x = [];
            var y = [];
            for (prop in pointers) {
                if (pointers.hasOwnProperty(prop) && prop !== 'count') {
                    if (e.pointerId == prop) {
                        pointers[prop].x = e.clientX;
                        pointers[prop].y = e.clientY;
                    }
                    x.push(pointers[prop].x);
                    y.push(pointers[prop].y);
                }
            }
            // Пифагор вроде
            distance = Math.pow(x[0] - x[1], 2) + Math.pow(y[0] - y[1], 2);
            if (!baseDistance) {
                baseDistance = distance;
                pinInput.value += '0';
            }
            var initScale = parseFloat(formula.getAttribute('scale')) || 2;
            var newScale = initScale + (distance - baseDistance) / 1000000;
            formula.style['max-width'] = newScale + '%';
            formula.setAttribute('scale', newScale);
        }
    }
    // Решение квеста
    pinInput.oninput = function () {
        if (pinInput.value === '450') {
            this.unlock();
        }
    }.bind(this);
}
Door2.prototype = Object.create(DoorBase.prototype);
Door2.prototype.constructor = DoorBase;

/**
 * Сундук
 * @class Box
 * @augments DoorBase
 * @param {Number} number
 * @param {Function} onUnlock
 */
function Box(number, onUnlock) {
    DoorBase.apply(this, arguments);

    // ==== Напишите свой код для открытия сундука здесь ====
    // Для примера сундук откроется просто по клику на него
    this.popup.addEventListener('click', function () {
        this.unlock();
    }.bind(this));
    // ==== END Напишите свой код для открытия сундука здесь ====

    this.showCongratulations = function () {
        alert('Поздравляю! Игра пройдена!');
    };
}
Box.prototype = Object.create(DoorBase.prototype);
Box.prototype.constructor = DoorBase;
