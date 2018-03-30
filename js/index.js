(function () {
    /* Singleton design
        for Data Layer
    */
    var MyStorage = (function () {
        // Instance stores a reference to the Singleton
        var instance;
        function init() {
            // Private methods and variables
            var data;
            if (localStorage.getItem('data')) {
                //localStorage only supports strings. Using JSON.stringify() and JSON.parse().
                data = JSON.parse(localStorage.getItem('data'));
            } else {
                data = [];
            };

            function setData(data) {
                localStorage.setItem("data", JSON.stringify(data));
            }

            return {
                // Public methods and variables

                getData: function () {
                    return data;
                },
                setData: function (data) {
                    setData(data);
                }
            };
        };
        return {
            getInstance: function () {
                if (!instance) {
                    instance = init();
                }
                return instance;
            }
        };
    })();




    /*Factory design
    for creating many note objects
    */
    var noteFactory = function (title, content) {
        var temp = {};
        temp.title = title;
        temp.content = content;
        temp.getTitle = function () {
            return this.title;
        }
        temp.getContent = function () {
            return this.content;
        }
        return temp;
    }


    //variable for data layer
    var storage;

    //variables for controller
    var DATA = [];
    var noteList; //contains all elements with class attribute = note
    var noteContainer = document.querySelector(".note-container");

    //variables for context menu
    var noteItemClassName = 'note';
    var menu = document.querySelector("#context-menu");
    var menuState = 0;
    var activeClassName = "context-menu--active";
    var menuPosition;
    var menuPositionX;
    var menuPositionY;
    var currentElementId;
    //variables for drag and drop feature
    var draggedElement = null;
    var draggedElementInnerHTML = null;


    function loadNotes() {
        var tempNoteData = storage.getData();
        for (var i = 0; i < tempNoteData.length; i++) {
            DATA[i] = noteFactory(tempNoteData[i].title, tempNoteData[i].content);
        }
        //if local storage is empty, DATA variable remains an empty Array.
    }

    //for determining which element has been right clicked upon
    function clickInsideElement(e, className) {
        var el = e.srcElement // || e.target; //extracting right clicked element
        //check if element has class attribute 'note', if not then the element doesn't require our custom context menu
        if (el.classList.contains(className)) {
            return el;
        } else {
            while (el = el.parentNode) {
                if (el.classList && el.classList.contains(className)) {
                    return el;
                }
            }
        }

        return false;
    }
    //for determining the position of right click context menu
    function getPosition(e) {
        var posx = 0;
        var posy = 0;

        if (!e) var e = window.event;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
        }

        return {
            x: posx,
            y: posy
        }
    }

    function contextListener() {
        document.addEventListener("contextmenu", function (e) {
            //check if element has class attribute 'note'
            if (clickInsideElement(e, noteItemClassName)) {
                e.preventDefault();
                //display context menu
                toggleMenuOn();
                positionMenu(e);
                currentElementId = e.path[0].id;


            } else {
                //don't display context menu
                toggleMenuOff();
            }
        });
    }

    function toggleMenuOn() {
        if (menuState !== 1) {
            menuState = 1;
            //display our custom context menu by applying class configured with css
            menu.classList.add(activeClassName);

        }
    }
    function toggleMenuOff() {
        if (menuState !== 0) {
            menuState = 0;
            //remove our custom context menu by applying class configured with css
            menu.classList.remove(activeClassName);
        }
    }
    //for regular click events
    function clickListener() {
        document.addEventListener("click", function (e) {
            var button = e.which || e.button;
            if (button === 1) {
                toggleMenuOff();
            }
        });
    }

    function deleteListener() {
        var deleteButton = document.getElementById('delete-button');
        deleteButton.addEventListener('click', function () {
            console.log('delete');
            DATA.splice(currentElementId, 1);
            //saving to local storage after delete
            storage.setData(DATA);
            clearNotes();
            renderNotes();
            dragAndDropListener();
        });
    }

    function dragAndDropListener() {
        if (document.querySelectorAll(".note")) {
            noteList = document.querySelectorAll(".note");
        };
        [].forEach.call(noteList, function (ele) {
            ele.addEventListener('dragstart', onDragStart, false);
            ele.addEventListener("dragenter", function (e) {
                e.preventDefault();
            }, false);
            ele.addEventListener("dragover", function (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                this.classList.add('over');
            }, false);
            ele.addEventListener('dragleave', function (e) {
                e.preventDefault();
                this.classList.remove('over');
            }, false);
            ele.addEventListener("drop", onDrop, false);
            ele.addEventListener('dragend', function (e) {
                e.preventDefault();
            }, false);
        });

    }
    function onDragStart(e) {
        currentElementId = e.path[0].id;
        console.log(currentElementId);
        e.dataTransfer.setData('innerHTML', this.innerHTML);
        e.dataTransfer.setData('id', currentElementId);
        draggedElement = this;

    }
    function onDrop(e) {
        var droppedElementId;
        if (e.path[1].id == '') {
            droppedElementId = e.path[2].id;
        }
        else {
            droppedElementId = e.path[1].id;
        };

        this.classList.remove('over');
        if (e.stopPropagation) {
            e.stopPropagation(); // stops the browser from redirecting.
        }
        if (draggedElement != this) {
            draggedElement.innerHTML = this.innerHTML;
            this.innerHTML = e.dataTransfer.getData('innerHTML');
            var tempdata = DATA[droppedElementId];
            DATA[droppedElementId] = DATA[currentElementId];
            DATA[currentElementId] = tempdata;
            storage.setData(DATA);

        }
    }
    function positionMenu(e) {
        menuPosition = getPosition(e);
        menuPositionX = (menuPosition.x - 60) + "px";
        menuPositionY = (menuPosition.y - 70) + "px";
        menu.style.left = menuPositionX;
        menu.style.top = menuPositionY;
    }

    function clearNotes() {
        var noteListId = document.querySelector('#note-list');
        console.log(noteListId);
        noteContainer.removeChild(noteListId);

    }
    function renderNotes() {
        if (DATA == null) {
            return;
        }
        var div = document.createElement("div");
        div.setAttribute('id', 'note-list');
        for (var i = 0; i < DATA.length; i++) {
            //css not wokring with insertAdjacentHTML so creating DOM

            var li = document.createElement("li");
            li.setAttribute('class', 'note');
            li.setAttribute('id', i);
            li.setAttribute('draggable', 'true');
            var a = document.createElement("a");
            var h2 = document.createElement("h2");
            h2.innerHTML = DATA[i].title;
            var p = document.createElement("p");
            p.innerHTML = DATA[i].content;
            a.appendChild(h2);
            a.appendChild(p);
            li.appendChild(a);
            div.appendChild(li);
        }
        noteContainer.insertAdjacentElement('beforeend', div);
    }


    function onCreateNoteClick() {

        var html = "<div class=\"modal-container\">\n" +
            "    <section class=\"create-modal\">\n" +
            "        <div class=\"form-group title\">\n" +
            "            <label class=\"sr-only\">Title</label>\n" +
            "            <input id=\"title\" type=\"text\" placeholder=\"Title...\" class=\"form-control\">\n" +
            "        </div>\n" +
            "        <div class=\"form-group\">\n" +
            "            <label class=\"sr-only\">Content</label>\n" +
            "            <textarea id=\"content\" type=\"text\" placeholder=\"Content...\" class=\"form-control\"></textarea>\n" +
            "        </div>\n" +
            "        <div class=\"form-group action-btn\">\n" +
            "            <button class=\"btn btn-primary \" id='cancel-button'>Cancel</button>\n" +
            "            <button class=\"btn btn-primary\" id='save-button'>Save</button>\n" +
            "        </div>\n" +
            "    </section>\n" +
            "</div>";
        document.getElementById('modal-container').innerHTML = html;
        document.getElementById('cancel-button').addEventListener('click', function () {
            document.getElementById('modal-container').innerHTML = "";
        });
        document.getElementById('save-button').addEventListener('click', function () {

            var title = document.getElementById('title').value;
            var content = document.getElementById('content').value;
            var newNote = {
                'title': title,
                'content': content
            };
            //adding new Note to DATA
            DATA.push(newNote);
            //saving modified DATA to storage
            storage.setData(DATA);
            //refreshing presentation layer by deleting old and creating new note list
            clearNotes();
            renderNotes();
            //adding drag and drop listener to note elements
            dragAndDropListener();
            document.getElementById('modal-container').innerHTML = "";
        });

    }

    function main() {
        //initialize datalayer
        storage = MyStorage.getInstance();
        //get data from datalayer and put it in controller variable
        loadNotes();
        //register various listeners
        contextListener();
        clickListener();
        document.getElementById('add-note').addEventListener('click', onCreateNoteClick);
        renderNotes();
        deleteListener();
        dragAndDropListener();
    }
    main();
})();