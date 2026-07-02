class UI {

    constructor(tagName, parent) {
        this.uuid = Symbol();
        if (tagName instanceof Element || tagName instanceof DocumentFragment) {
            this.el = tagName;
        } else {
            this.el = document.createElement(tagName);
        }
        if (parent) {
            this.parent = parent;
            if (this.parent.tagName) {
                this.parent.append(this.el);
            } else if (this.parent.el) {
                this.parent.el.append(this.el);
            }
        }
    }

    setUp(builder) {
        builder(this);
        return this;
    }

    hasParent() {
        return this.parent;
    }

    html(html) {
        if (html instanceof UI) {
            this.clear();
            this.append(html);
        } else {
            this.el.innerHTML = html;
        }
        return this;
    }

    plain(text) {
        this.el.innerText = text;
        return this;
    }

    clear() {
        return this.plain('');
    }

    attr(name, value) {
        if (typeof name === 'string') {
            this.el.setAttribute(name, value);
        } else if (typeof name === 'object') {
            Object.keys(name).forEach(each => {
                this.el.setAttribute(each, name[each]);
            });
        }
        return this;
    }

    removeAttr(name) {
        this.el.removeAttribute(name);
        return this;
    }

    child(component, builder) {
        if (typeof component === 'string') {
            component = new UI(component, this);
        } else {
            this.append(component);
        }
        if (builder) {
            builder(component);
        }
        return component;
    }

    append(el, builder) {
        if (typeof el === 'string') {
            const child = document.createElement(el);
            if (builder) {
                builder(child);
            }
            this.append(child);
            return child;
        } else if (el.tagName) {
            this.el.append(el);
        } else if (el.el) {
            el.parent = this;
            this.el.append(el.el);
        } else if (el.nodeType === 3 || el.nodeType === 11) {
            this.el.append(el);
        } else if (el.html) {
            DomUtil.append(this.el, el.html);
            return new UI(this.el.lastChild);
        } else if (Array.isArray(el)) {
            return new UIArray(el, this);
        }
    }

    appendBefore(ui) {
        this.el.before(ui.el);
    }

    appendAfter(ui) {
        this.el.after(ui.el);
    }

    query(selector) {
        return this.el.querySelector(selector);
    }

    queryAll(selector) {
        return this.el.querySelectorAll(selector);
    }

    show(mode = 'block') {
        mode = this.el.dataset.beforeDisplay || mode;
        DomUtil.showByDisplay(mode, this.el);
        return this;
    }

    hide() {
        DomUtil.hide(this.el);
        return this;
    }

    hasClass(className) {
        return DomUtil.hasClass(this.el, className);
    }

    addClass(...classNames) {
        DomUtil.addClass(this.el, ...classNames);
        return this;
    }

    removeClass(...classNames) {
        DomUtil.removeClass(this.el, ...classNames);
        return this;
    }

    toggleClass(...classNames) {
        DomUtil.toggleClass(this.el, ...classNames);
        return this;
    }

    css(properties) {
        DomUtil.css(this.el, properties);
        return this;
    }

    reattach() {
        if (this.parent) {
            if (this.parent.tagName) {
                this.parent.append(this.el);
            } else if (this.parent.el) {
                this.parent.el.append(this.el);
            }
        }
    }

    detach() {
        this.el.remove();
    }

    remove() {
        this.el.remove();
    }

    on(eventName, listener) {
        this.el.addEventListener(eventName, listener);
        return listener;
    }

    off(eventName, listener) {
        this.el.removeEventListener(eventName, listener);
    }

    focus() {
        if (this.el.focus) {
            this.el.focus();
        }
    }

    enable() {
        if (this.el instanceof HTMLButtonElement || this.el instanceof HTMLInputElement || this.el instanceof HTMLTextAreaElement) {
            this.el.disabled = false;
        } else {
            this.removeClass('disabled');
        }
        return this;
    }

    disable() {
        if (this.el instanceof HTMLButtonElement || this.el instanceof HTMLInputElement || this.el instanceof HTMLTextAreaElement) {
            this.el.disabled = true;;
        } else {
            this.addClass('disabled');
        }
        return this;
    }

    async skeleton(loader, size = 2, message) {
        this.addClass('skeleton');
        const skeleton = new UI('ui-skeleton', this);
        if (message) {
            new Message(message, skeleton);
        }
        for (let i = 0; i < size; i++) {
            new UI('p', skeleton).css({
                width: `${Math.min(100, 40 + (60 * Math.random()))}%`,
            });
        }
        setTimeout(async () => {
            try {
                await loader();
            } finally {
                skeleton.remove();
                this.removeClass('skeleton');
            }
        }, 200);
    }

}

class UIArray extends UI {

    #addSeparator;

    constructor(model, parent, addSeparator = false) {
        super('ui-array', parent);
        this.#addSeparator = addSeparator;
        this.add(model);
    }

    add(child) {
        if (child instanceof UI) {
            if (this.#addSeparator && this.el.children.length) {
                this.append(new Plain('|').addClass('separator'));
            }
            this.append(child);
        } else if (child instanceof Function) {
            const result = child();
            if (result) {
                this.add(result);
            }
        } else if (Array.isArray(child)) {
            child.forEach(each => this.add(each));
        } else if (child) {
            if (this.#addSeparator && this.el.children.length) {
                this.append(new Plain('|').addClass('separator'));
            }
            this.append(child);
        }
    }

    link(model) {
        this.add(new Link(model));
    }

}
class Panel extends UI {

    #actions;

    constructor(model, parent) {
        super('ui-panel', parent);
        let name;
        if (model) {
            if (typeof model === 'string') {
                name = model;
            } else if (model.name) {
                name = model.name;
            }
        }
        if (name) {
            const h1 = new UI('h1', new UI('header', this));
            if (name instanceof UI) {
                h1.append(name);
            } else {
                h1.plain(name);
            }
            if (model.required) {
                new UI('i', h1).plain('*');
            }
        }
    }

    set name(name) {
        let h1 = this.query('header > h1');
        if (!h1) {
            let header = this.query('header');
            if (header) {
                h1 = new UI('h1').el;
                header.el.prepend(h1);
            } else {
                header = new UI('header');
                this.el.prepend(header.el);
                h1 = new UI('h1', header).el;
            }
        }
        if (Array.isArray(name)) {
            h1.innerText = '';
            name.forEach(each => h1.append(each.el));
        } else if (name instanceof UI) {
            h1.innerText = '';
            h1.append(name.el);
        } else {
            h1.innerText = name;
        }
    }

    link(model) {
        const result = new Link(model)
        this.addAction(result);
        return result;
    }

    addLink(model) {
        return this.link(model);
    }

    addButton(model) {
        const result = new Button(model);
        this.addAction(result);
        return result;
    }

    addAction(ui) {
        if (!this.#actions) {
            this.#actions = new UI('h2', this.query('header') || this).addClass('mobile-scroll');
        }
        this.#actions.append(ui);
    }

    clear() {
        [... this.el.children].forEach((each, i) => {
            if (i !== 0 || each.tagName !== 'HEADER') {
                each.remove();
            }
        })
    }

}
class Field extends UI {

    #model;

    #value;

    constructor(model, parent) {
        super('ui-field', parent);
        this.#model = model;
        if (!model.label && model.name) {
            model.label = I18n.get(`label.${WebUtils.underscore(model.name)}`);
        }
        this.child('label', label => {
            label.attr('for', `_${++_FIELD_ID}`);
            label.html(model.label);
            if (model.required) {
                label.child('i').html('*');
            }
        });
        const { plainValue } = model;
        if (typeof plainValue === 'boolean') {
            if (plainValue) {
                this.#value = new Icon('check_box', this).addClass('size-2', 'green');
            } else {
                this.#value = new Icon('check_box_outline_blank', this).addClass('size-2');
            }
        } else if (plainValue) {
            let valueHolder = this;
            if (model.description) {
                valueHolder = new UI('ui-field-value-with-description', this);
            }
            if (plainValue instanceof UI) {
                valueHolder.append(plainValue);
                this.#value = plainValue;
            } else if (plainValue) {
                if (typeof plainValue === 'number') {
                    this.#value = new NumberUnit(plainValue, valueHolder);
                } else if (plainValue.type) {
                    this.#value = new UI(plainValue.type, valueHolder).plain(plainValue.value);
                } else {
                    this.#value = new UI('span', valueHolder).plain(plainValue);
                }
            }
            if (model.description) {
                new Message(model.description, valueHolder);
            }
        }
    }

    set value(value) {
        if (typeof value === 'boolean') {
            if (!this.#value) {
                if (value) {
                    new Icon('check_box', this).addClass('size-2', 'green');
                } else {
                    new Icon('check_box_outline_blank', this).addClass('size-2');
                }
            }
        } else if (typeof value === 'string' || typeof value === 'number') {
            if (this.#value) {
                if (this.#value instanceof Html) {
                    this.#value.html(value);
                } else if (this.#value instanceof Img) {
                    this.#value.src = value;
                } else {
                    this.#value.plain(value);
                }
            } else {
                if (typeof value === 'number') {
                    this.queryAll('ui-number').forEach(each => each.remove());
                    new NumberUnit(value, this);
                } else {
                    this.queryAll('span').forEach(each => each.remove());
                    new UI('span', this).plain(value);
                }
            }
        }
    }

    required() {
        return this.#model.required;
    }

}
class Accordion extends UI {

    #items = [];

    constructor(parent) {
        super('ui-accordion', parent);
    }

    add(name, ui, open = false) {
        if (ui) {
            const result = new AccordionItem(name, ui, this);
            this.#items.push(result);
            if (open) {
                result.toggle();
            }
            return result;
        } else if (typeof name === 'string') {
            return this.child('p').html(name);
        } else if (name instanceof UI) {
            return this.append(name);
        }
    }

    get(i) {
        return this.#items[i];
    }

    get count() {
        return this.#items.length;
    }

    select(i) {
        const item = this.get(i);
        if (item && !item.opened) {
            item.toggle();
        }
    }

}

class AccordionItem extends UI {

    #opened;

    #icon;

    #main;

    constructor(name, ui, parent) {
        super('ui-accordion-item', parent);
        this.child('header', header => {
            if (name instanceof UI) {
                header.child('h1').append(name);
            } else {
                header.child('h1').html(name);
            }
            this.#icon = new Icon('keyboard_arrow_down', header);
            header.on('click', () => {
                if (ui instanceof LazyPanel) {
                    ui.remove();
                    ui = ui.run();
                    this.#main.append(ui);
                }
                this.toggle();
            });
        });
        this.#main = this.child('main');
        this.#main.append(ui);
    }

    get opened() {
        return this.#opened;
    }

    toggle() {
        this.#opened = !this.#opened;
        if (this.#opened) {
            this.el.dataset.opened = 'true';
            this.#icon.icon = 'keyboard_arrow_up';
        } else {
            this.#icon.icon = 'keyboard_arrow_down';
            delete this.el.dataset.opened;
        }
    }

    clearAndAdd(ui) {
        this.#main.clear();
        this.#main.append(ui);
        if (!this.#opened) {
            this.toggle();
        }
    }

}
class TextAction extends UI {

    constructor({ listener, placeholder }, parent) {
        super('ui-text-action', parent);
        const input = new UI('input', this).attr('type', 'text');
        if (placeholder) {
            input.attr('placeholder', placeholder);
        }
        input.on('keyup', ({ key }) => {
            const value = input.el.value;
            if (value) {
                button.enable();
                if (key === 'Enter') {
                    listener(value);
                }
            } else {
                button.disable();
            }
        });
        const button = new Icon({
            icon: 'send',
            title: I18n.get('label.execute'),
            listener: () => {
                listener(input.el.value);
            },
        }, this).disable().addClass('fill');
    }

}
class AssistantSelector extends UI {

    #current;

    constructor(assistants, parent) {
        super('div', parent);
        if (assistants.length) {
            this.#current = assistants[0];
            new Dropdown({
                value: this.#current.id,
                values: assistants,
                listener: (v) => {
                    const a = assistants.find(each => each.id === v);
                    this.#current = a;
                    this.addMessage(I18n.get('label.ai_assistant_changed', a.name));
                    this.addMessage(a.welcomeMessage);
                },
            }, this);
            this.addMessage(this.#current.welcomeMessage);
        }
    }

    addMessage(message) {
        if (message) {
            const prompt = this.el.closest('ai-prompt');
            if (prompt) {
                new Message({ content: message, closable: true, }, this.el.closest('ai-prompt').previousElementSibling);
            }
        }
    }

    get id() {
        return this.#current.id;
    }

}

class AIPanel extends UI {

    #prompt;

    #thread;

    #listener;

    constructor({ assistants = [], listener, }, parent) {
        super('ai-panel', parent);
        this.addClass('flex', 'flex-col', 'gap-4', 'overflow-hidden');
        if (assistants.length) {
            this.#listener = listener;
            this.#thread = new AIThread(this);
            this.#prompt = new AIPrompt(assistants, this);
        } else {
            new Message(I18n.get('label.ai_assistant_unavailable'), this);
        }
    }

    run(assistantId, prompt) {
        if (prompt) {
            const section = new UI('div', this.#thread).addClass('flex', 'flex-col', 'gap-4');
            new AIQuery(prompt, section);
            const answer = new UI('div', section);
            answer.skeleton(async () => {
                await this.#listener(assistantId, prompt, answer);
                answer.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                this.#prompt.enable();
            }, 4);
        }
    }

    focus() {
        this.#prompt && this.#prompt.focus();
    }

}


class AIPrompt extends UI {

    #input;

    #icon;

    constructor(assistants, panel) {
        super('ai-prompt', panel);
        const listener = () => {
            const v = this.#input.value;
            if (v && this.#icon.icon !== 'stop') {
                panel.run(assistantSelector.id, v);
                this.#input.value = '';
                this.#icon.icon = 'stop';
            }
        };
        this.#input = new ResizableTextarea(this);
        this.#input.on('keydown', event => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                listener();
            }
        });
        this.#icon = new Icon({
            icon: 'arrow_upward',
            listener,
        }, this);
        const assistantSelector = new AssistantSelector(assistants, this);
        this.on('click', () => this.focus());
    }

    enable() {
        this.#icon.icon = 'arrow_upward';
    }

    focus() {
        setTimeout(() => {
            this.#input.focus();
        }, 200);
    }

}

class AIThread extends UI {

    constructor(parent) {
        super('ai-thread', parent);
        this.addClass('flex', 'flex-col', 'gap-4', 'mouseover-scrollbar')
    }

}

class AIQuery extends UI {

    constructor(prompt, parent) {
        super('ai-query', parent);
        new UI('p', this).html(prompt);
        new UIArray([
            new Icon({
                icon: 'content_copy',
                title: I18n.get('label.copy'),
                listener: () => new WebClipboard().copy(prompt),
            }),
            new Icon({
                icon: 'delete',
                title: I18n.get('label.remove'),
                listener: () => parent.remove(),
            }),
        ], this);
        this.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

}
class Alarm {

    #type;

    #id;

    #panel;

    constructor(type, id) {
        this.#type = type;
        this.#id = id;
    }

    get panel() {
        return this.#panel;
    }

    open() {
        DrawerManager.toggle(`alarm_${this.#id}`, () => {
            const drawer = new Drawer({
                title: I18n.get('label.alarm'),
                actions: [
                    new Link({
                        name: I18n.get('label.create_alarm'),
                        listener: () => this.create(),
                    })
                ],
            });
            this.#panel = new UI('ui-flex-panel', drawer);
            this.load();
            return drawer;
        });
    }

    async load() {
        this.#panel.clear();
        const response = await Http.get(`/r/alarm/load/${this.#id}`);
        response.forEach(each => new AlarmItem(each, this));
    }

    create() {
        const modal = new Modal({
            title: I18n.get('label.create_alarm'),
        });
        const form = new Form();
        const fields = modal.addComponent(new Fields({ form }));
        fields.text({
            name: 'title',
            required: true,
        });
        fields.date({
            name: 'date',
            required: true,
        });
        fields.time({
            name: 'hour',
            required: true,
            value: 9,
        });
        modal.button({
            name: I18n.get('label.save'),
            listener: async () => {
                const parameter = form.parameter;
                if (parameter) {
                    parameter.subject = this.#id;
                    parameter.type = this.#type;
                    await Http.post('/r/alarm/create', parameter);
                    this.load();
                    modal.close();
                }
            }
        });
    }

}

class AlarmItem extends UI {

    #alarm;

    constructor(model, alarm) {
        super('ui-alarm-item', alarm.panel);
        this.#alarm = alarm;
        const { id, type, state, title, time } = model;
        this.el.dataset.state = state;
        new UI('h1', this).plain(title);
        new UIArray([
            new Label({
                name: type,
                color: this.getColor(type),
            }, this),
            new DateTime(time),
            new Link({
                name: I18n.get('label.update'),
                listener: () => this.update(model),
            }),
            new Link({
                name: I18n.get('label.remove'),
                listener: async () => {
                    if (I18n.confirm('label.confirm_remove')) {
                        await Http.post(`/r/alarm/remove/${id}`);
                        this.remove();
                    }
                }
            })
        ], this);
    }

    getColor(type) {
        if (type === 'ACCOUNT_ALARM') {
            return 'RED';
        } else if (type === 'BOOK_ALARM') {
            return 'TEAL';
        } else if (type === 'CHAPTER_ALARM') {
            return 'INDIGO';
        } else if (type === 'CUSTOMER_ALARM') {
            return 'AMBER';
        } else if (type === 'MY_ALARM') {
            return 'BLUE';
        } else if (type === 'TASK_ALARM') {
            return 'GREEN';
        } else {
            return 'BLUE';
        }
    }

    update(model) {
        const modal = new Modal({
            title: I18n.get('label.update_alarm'),
        });
        const form = new Form();
        const fields = modal.addComponent(new Fields({ form }));
        fields.text({
            name: 'title',
            required: true,
        });
        fields.date({
            name: 'date',
            required: true,
        });
        fields.time({
            name: 'hour',
            required: true,
        });
        form.parameter = model;

        modal.button({
            name: I18n.get('label.save'),
            listener: async () => {
                const parameter = form.parameter;
                if (parameter) {
                    await Http.post(`/r/alarm/update/${model.id}`, parameter);
                    modal.close();
                    this.#alarm.load();
                }
            }
        });
    }

}
const Animcation = {

    fadeIn: (element) => {
        if (Array.isArray(element)) {
            element.forEach(each => Animcation.fadeIn(each));
        } else {
            DomUtil.addClass(element, 'animation_fade_in');
            const f = () => {
                DomUtil.removeClass(element, 'animation_fade_in');
                element.removeEventListener('animationend', f);
            };
            element.addEventListener('animationend', f);
        }
    },

    fadeOut: element => {
        if (element.el) {
            element = element.el;
        }
        if (Array.isArray(element)) {
            element.forEach(each => Animcation.fadeOut(each));
        } else {
            DomUtil.addClass(element, 'animation_fade_out');
            const f = () => {
                DomUtil.removeClass(element, 'animation_fade_out');
                element.removeEventListener('animationend', f);
                element.remove();
            };
            element.addEventListener('animationend', f);
        }
    },

    scrollReveal(panel) {
        const elements = panel.querySelectorAll('.scroll-reveal');
        if (elements.length) {
            const observer = Animcation.createScrollReveal();
            elements.forEach(content => observer.observe(content));
        }
    },

    createScrollReveal() {
        return new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const ratio = entry.intersectionRatio;
                if (ratio > 0.3) {
                    // 30% 이상 보이면 visible
                    entry.target.classList.add('scroll-reveal-visible');
                    entry.target.classList.remove('scroll-reveal-hidden');
                } else if (entry.boundingClientRect.top < 0) {
                    // 위로 스크롤되어 사라지면 hidden
                    entry.target.classList.remove('scroll-reveal-visible');
                    entry.target.classList.add('scroll-reveal-hidden');
                } else {
                    // 아직 안 보이면 기본 상태
                    entry.target.classList.remove('scroll-reveal-visible');
                    entry.target.classList.remove('scroll-reveal-hidden');
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: [0, 0.1, 0.5, 0.9, 1]
        });
    }

}
const ComponentType = {

    PROFILE: Symbol(),

    APPLICATION: Symbol(),

    APPLICATION_OPTION: Symbol(),

    CONTROLLER: Symbol(),

    VISUAL_CANVAS: Symbol(),

    MONACO_EDITOR: Symbol(),

    MONACO_TAILWINDCSS: Symbol(),

    MONACO_DIFF_EDITOR: Symbol(),

    PAGE: Symbol(),

    PAGE_OPTION: Symbol(),

    DOC_PREVIEWER: Symbol(),

    TASK_VIEWER: Symbol(),

    VIDEO_MANAGER: Symbol(),

};

const EventType = {

    BANNER_CLOSED: Symbol(),

    ELEMENT_EDITOR_CLOSED: Symbol(),

    ELEMENT_EDITOR_OPENED: Symbol(),

    LOCATION_CHANGED: Symbol(),

    OUTLINE_CHANGED: Symbol(),

    SEARCH_STARTED: Symbol(),

    SEARCH_COMPLETED: Symbol(),

    SEARCH_PROGRESS: Symbol(),

    TASK_CHANGED: Symbol(),

    VIDEO_CLIP_SELECTED: Symbol(),

    VISUAL_SHAPE_SELECTED: Symbol(),

    WORKSPACE_ITEM_CHANGED: Symbol(),

    WORKSPACE_ITEM_REMOVED: Symbol(),

    WORKSPACE_ITEM_SAVED: Symbol(),

    WORKSPACE_ITEM_SELECTED: Symbol(),

    VISUAL_PAGE_CHANGED: Symbol(),

    VISUAL_PAGE_SHAPE_CHANGED: Symbol(),

    IGNORE: Symbol(),

};


const Applications = {

    components: new Map(),

    listeners: new Map(),

    get: id => {
        return Applications.components.get(id);
    },

    set: (id, component) => {
        Applications.components.set(id, component);
    },

    remove: id => {
        Applications.components.delete(id);
    },

    getId: () => {
        return Applications.getOption().id;
    },

    getOption: () => {
        return Applications.get(ComponentType.APPLICATION_OPTION);
    },

    page: () => {
        return Applications.get(ComponentType.PAGE);
    },

    getPageOption: () => {
        return Applications.get(ComponentType.PAGE_OPTION);
    },

    user: () => {
        return Applications.getOption().user;
    },

    hasRole: role => {
        const user = Applications.user();
        return user && user.roles.includes(role);
    },

    getApplication: () => {
        return Applications.get(ComponentType.APPLICATION);
    },

    getController: () => {
        return Applications.get(ComponentType.CONTROLLER);
    },

    init: (loader, option) => {
        if (option) {
            Applications.dateTimeFormat = option.dateTimeFormat;
            Applications.set(ComponentType.APPLICATION_OPTION, option);
            if (option.moduleType) {
                document.body.dataset.moduleType = option.moduleType;
            }
            if (option.enableContentLazyLoad) {
                DomUtil.addClass(document.body, 'content-lazy-load');
            }
            if (option.disableDevTools) {
                console.log(Object.defineProperties(new Error, {
                    toString: { value() { (new Error).stack.includes('toString@') && alert('Safari devtools') } },
                    message: {
                        get() {
                            setTimeout(() => {
                                document.body.innerHTML = `<div style="font-size: 1rem; margin: 1rem;">${I18n.get('label.unable_to_open_developer_tools')}</div>`;
                            }, 1000);
                        }
                    },
                }));
            }
            if (option.limitShortcutKeys) {
                new ShortcutKeysLimiter(option);
            }
        }
        document.fonts.load('12px "Material Icons"').then(() => I18n.load(loader));
    },

    addEventListener: (eventType, listener) => {
        let v = Applications.listeners.get(eventType);
        if (!v) {
            v = [];
            Applications.listeners.set(eventType, v);
        }
        v.push(listener);
    },

    fire: (eventType, data = {}) => {
        let v = Applications.listeners.get(eventType);
        if (v) {
            v.forEach(each => each(data));
        }
    },

}

class Application extends UI {

    #main;

    #mobileMore;

    constructor(parent = document.body, disableTop) {
        super('ui-application', parent);
        Applications.set(ComponentType.APPLICATION, this);
        this.el.style.gridTemplateColumns = '0 0 1fr';
        this.sidebarManager = new SidebarManager(this);
        this.#main = new ApplicationMain(this);
        this.#mobileMore = new MobileMore(this);
        if (window.localStorage.getItem('theme') === 'dark') {
            DomUtil.addClass(document.documentElement, 'dark');
            const meta = [...document.querySelectorAll('meta')].find(each => each.name === 'theme-color');
            if (meta) {
                if (!meta.dataset.color) {
                    meta.dataset.color = meta.content;
                }
                meta.content = '#2b303b';
            }
        } else {
            DomUtil.addClass(document.documentElement, 'light');
        }
        if (!disableTop) {
            this.getTop();
        }
    }

    get main() {
        return this.#main;
    }

    add(component) {
        this.#main.append(component);
        return component;
    }

    getTop() {
        if (!this.top) {
            this.addClass('has-top');
            this.top = new ApplicationTop();
            this.el.prepend(this.top.el);
        }
        return this.top;
    }

    addSidebarButton(button) {
        this.el.style.gridTemplateColumns = '2.5rem 0 1fr';
        this.enableSidebar = true;
        return this.sidebarManager.add(button);
    }

    getCurrentButtonIndex() {
        return this.sidebarManager.getCurrentButtonIndex();
    }

    openSidebar(button, builder) {
        const selected = this.sidebarManager.toggle(button);
        if (selected) {
            this.sidebarManager.show(button, builder);
            this.el.style.gridTemplateColumns = '2.5rem auto 1fr';
        } else {
            if (DomUtil.hasClass(document.body, 'mobile_sidebar_opened')) {
                this.#mobileMore.closeSidebar();
            } else {
                this.el.style.gridTemplateColumns = '2.5rem 0 1fr';
            }
        }
    }

    runPreviousSidebarButton() {
        const { moduleType } = Applications.getOption();
        if (moduleType) {
            const value = localStorage.getItem(`sidarbar_opened_${moduleType}`);
            if (value) {
                try {
                    this.runSidebarButton(Number(value));
                } catch (ignore) {
                    console.error(ignore);
                }
            }
        }
    }

    runSidebarButton(i) {
        this.sidebarManager.runButton(i);
    }

    clearSidebarButtons() {
        this.sidebarManager.clearButtons();
    }

    scrollTo(x, y) {
        y -= this.#main.el.getBoundingClientRect().y;
        this.#main.el.scrollTo(x, y);
    }

    scroll(element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }

}

class ApplicationMain extends UI {

    constructor(parent) {
        super('ui-main', parent);
        this.addClass('mouseover-scrollbar');
    }

}

class ApplicationTop extends UI {

    constructor() {
        super('ui-top');
        new Avatar(Applications.user(), this);
    }

}

class Footer extends UI {

    constructor(footerPage, parent) {
        super('ui-footer', parent);
        if (footerPage) {
            new WebPage(footerPage, this);
        }
    }

}

class MobileMore {

    #opened;

    #icon;

    #closeListener;

    constructor(parent) {
        this.#icon = new Icon({
            icon: 'unfold_more',
            listener: event => {
                event.stopPropagation();
                if (this.#opened) {
                    this.closeSidebar();
                } else {
                    if (document.body.dataset.moduleType === 'EDITOR') {
                        if (parent.getCurrentButtonIndex() === -1) {
                            parent.runSidebarButton(2);
                        }
                    }
                    this.openSidebar();
                }
            },
        }, parent).addClass('mobile_more');
    }

    openSidebar() {
        this.#opened = true;
        DomUtil.addClass(document.body, 'mobile_sidebar_opened');
        this.#icon.icon = 'close';
        this.#closeListener = (event) => {
            if (!event.target.closest('ui-sidebar,ui-sidebar-buttons,ui-floating-panel')) {
                this.closeSidebar();
            }
        };
        document.addEventListener('click', this.#closeListener);
    }

    closeSidebar() {
        this.#opened = false;
        DomUtil.removeClass(document.body, 'mobile_sidebar_opened');
        this.#icon.icon = 'unfold_more';
        document.removeEventListener('click', this.#closeListener);
    }

}

class SingleController {

    constructor() {
        const option = Applications.getOption();
        const app = new Application();
        const t = window[option.parameter.loader];
        new t(app, option.parameter);
    }

}
class Avatar extends UI {

    constructor(user, parent) {
        super('ui-avatar', parent);
        const { exportType, watermark, } = Applications.getOption();
        if (exportType === 'HTML') {
            this.append(this.getThemeToggle());
            return;
        } else if ('ontouchstart' in document.documentElement && watermark) {
            new UI('ui-watermark', document.body).plain(`${user.userId}/${user.name}`);
        }
        // new Icon('person', this);
        if (user) {
            new Plain(user.name, this);
        }
        new Icon('more_horiz', this);

        this.on('click', event => {
            const cm = new ContextMenu();
            cm.add({
                name: this.getThemeToggle(),
                independent: true,
            });
            cm.addSeparator();
            if (user) {
                cm.add({
                    name: I18n.get('label.my_profile'),
                    listener: () => {
                        if (Applications.getOption().moduleType === 'APP') {
                            window.location.href = '#/r/my_profile';
                        } else {
                            window.open('/!#/r/my_profile');
                        }
                    },
                });
                if (!user.authenticatedExternally) {
                    cm.add({
                        name: I18n.get('label.update_password'),
                        listener: () => {
                            if (Applications.getOption().moduleType === 'APP') {
                                window.location.href = '#/r/my_profile/update_password';
                            } else {
                                window.open('/!#/r/my_profile/update_password');
                            }
                        },
                    });
                }
                if (Applications.getOption().DEV) {
                    cm.add({
                        name: I18n.get('label.i18n_refresh'),
                        listener: () => Http.post('/r/i18n/refresh'),
                    });
                }
                cm.add({
                    name: I18n.get('label.logout'),
                    listener: () => window.location.href = '/r/signon/logout',
                });
            } else {
                cm.add({
                    name: I18n.get('label.login'),
                    listener: () => window.location.href = `/r/signon/connect?path=${window.location.pathname}`,
                });
            }
            cm.open(this);
        });
    }

    getThemeToggle() {
        return new RadioGroup({
            value: DomUtil.hasClass(document.documentElement, 'dark') ? 'dark' : 'light',
            values: [
                {
                    value: 'light',
                    icon: 'light_mode',
                },
                {
                    value: 'dark',
                    icon: 'dark_mode',
                },
            ],
            input: (v, event) => {
                event.preventDefault();
                event.stopPropagation();
                if (document.startViewTransition) {
                    const x = event.clientX;
                    const y = event.clientY;
                    const transition = document.startViewTransition(() => {
                        this.changeTheme(v);
                    });
                    transition.ready.then(() => {
                        const radius = Math.hypot(
                            Math.max(x, innerWidth - x),
                            Math.max(y, innerHeight - y)
                        );
                        document.documentElement.animate(
                            {
                                clipPath: [
                                    `circle(0px at ${x}px ${y}px)`,
                                    `circle(${radius}px at ${x}px ${y}px)`,
                                ],
                            },
                            {
                                duration: 500,
                                easing: 'ease-in',
                                pseudoElement: '::view-transition-new(root)',
                            }
                        );
                    });
                } else {
                    this.changeTheme(v);
                }
            },
        });
    }

    changeTheme(v) {
        const meta = [...document.querySelectorAll('meta')].find(each => each.name === 'theme-color');
        if (v === 'dark') {
            DomUtil.addClass(document.documentElement, 'dark');
            DomUtil.removeClass(document.documentElement, 'light');
            window.localStorage.setItem('theme', 'dark');
            if (!meta.dataset.color) {
                meta.dataset.color = meta.content;
            }
            meta.content = '#2b303b';
        } else {
            DomUtil.addClass(document.documentElement, 'light');
            DomUtil.removeClass(document.documentElement, 'dark');
            window.localStorage.removeItem('theme');
            if (meta.dataset.color) {
                meta.content = meta.dataset.color;
            }
        }
        const monacoEditor = Applications.get(ComponentType.MONACO_EDITOR);
        if (monacoEditor) {
            monacoEditor.updateOptions({ theme: DomUtil.hasClass(document.documentElement, 'dark') ? 'vs-dark' : 'vs' });
        }
        const monacoTailwindcssEditor = Applications.get(ComponentType.MONACO_TAILWINDCSS);
        if (monacoTailwindcssEditor) {
            monacoTailwindcssEditor.updateOptions({ theme: DomUtil.hasClass(document.documentElement, 'dark') ? 'vs-dark' : 'vs' });
        }
        const monacoDiffEditor = Applications.get(ComponentType.MONACO_DIFF_EDITOR);
        if (monacoDiffEditor) {
            monacoDiffEditor.updateOptions({ theme: DomUtil.hasClass(document.documentElement, 'dark') ? 'vs-dark' : 'vs' });
        }
    }

}
class Badge extends UI {

    #count = 0;

    #parentBadge;

    constructor(model, parent) {
        super('ui-badge', parent);
        if (model) {
            if (typeof model === 'string') {
                this.html(model);
            } else if (typeof model === 'number') {
                this.#count = model;
                this.setNumber(model);
            } else if (typeof model === 'object') {
                this.html(model.name || model.label);
                if (model.id) {
                    this.el.dataset.type = model.id;
                }
            }
        }
    }

    set parentBadge(b) {
        this.#parentBadge = b;
    }

    clear() {
        super.clear();
        this.#count = 0
    }

    set name(name) {
        this.html(name);
    }

    set count(c) {
        this.#count = c;
        this.setNumber(c);
        if (this.#parentBadge) {
            this.#parentBadge.increment(c);
        }
    }

    increment(c) {
        this.#count += c;
        this.setNumber(this.#count);
        if (this.#parentBadge) {
            this.#parentBadge.increment(c);
        }
    }

    setNumber(value) {
        this.plain(value.toLocaleString('en-US'));
    }

}
class Banner extends UI {

    constructor(model, parent) {
        super('ui-banner', parent);
        new UIArray([
            new Html(model.name),
            () => {
                if (model.closable) {
                    return new Icon({
                        icon: 'close',
                        title: I18n.get('label.close'),
                        listener: () => this.close(model),
                    }, this);
                }
            }
        ], new UI('h1', this));
        this.child('p').html(model.content);
        Applications.addEventListener(EventType.BANNER_CLOSED, ({ id }) => {
            if (id === model.id) {
                this.remove();
            }
        });
    }

    close({ id, time }) {
        const o = window.localStorage.getItem('web_viewer_banner_option');
        const bannerOption = o ? JSON.parse(o) : {};
        bannerOption[id] = time;
        window.localStorage.setItem('web_viewer_banner_option', JSON.stringify(bannerOption));
        this.remove();
        Applications.fire(EventType.BANNER_CLOSED, { id, });
    }

}

class BannerManager {

    open(banners, panel) {
        if (!banners || banners.length === 0) {
            return;
        }
        const o = window.localStorage.getItem('web_viewer_banner_option');
        const bannerOption = o ? JSON.parse(o) : {};
        const parent = new UI('ui-banners', panel);
        banners.forEach(each => {
            if (!each.modal) {
                if (each.time !== -1) {
                    const time = bannerOption[each.id];
                    if (time && time >= each.time) {
                        return;
                    }
                }
                new Banner(each, parent);
            }
        });
        return parent;
    }

    openModal(banners) {
        if (!banners || banners.length === 0) {
            return;
        }
        const o = window.localStorage.getItem('web_viewer_banner_option');
        const bannerOption = o ? JSON.parse(o) : {};
        banners = banners.filter(each => each.modal && (bannerOption[each.id] || -1) < each.time);
        banners.forEach(banner => {
            banner.closable = false;
            const bannerUI = new Banner(banner);
            const modal = new Modal({
                title: I18n.get('label.banner'),
            });
            const panel = modal.addComponent(new UI('ui-banners'));
            panel.append(bannerUI);
            new Link({
                name: I18n.get('label.banner_is_no_longer_open'),
                listener: event => {
                    bannerUI.close(banner);
                    modal.close();
                }
            }, panel);
        });
    }

}
class Breadcrumb extends UI {

    #listener;

    constructor(model, parent) {
        super('ui-breadcrumb', parent);
        this.addClass('mobile-scroll');
        this.addClass('sticky', 'top-0', 'pb-2');
        this.css({
            zIndex: '2',
        });
        this.#listener = model.listener;
    }

    add(model) {
        if (this.el.innerHTML) {
            new Icon('keyboard_arrow_right', this);
        }
        if (model.href || model.listener || this.#listener) {
            new Link({
                name: new Html(model.name),
                listener: (event, link) => {
                    if (model.listener) {
                        model.listener(model, event, link);
                    } else if (model.href) {
                        window.location.href = model.href;
                    } else {
                        this.#listener(model, event);
                    }
                },
            }, this);
        } else if (model instanceof UI) {
            this.append(model);
        } else {
            new Html(model.name, this);
        }
    }

    addProject(p, current) {
        if (!p) {
            return;
        }
        while (p) {
            const { id, name } = p;
            this.add({
                id,
                name,
                listener: async (model, event, link) => {
                    const documents = await Http.get(`/r/viewer/get_documents_by_project/${id}`);
                    if (documents.length) {
                        const cm = new ContextMenu();
                        documents.forEach(each => {
                            cm.add({
                                name: each.title,
                                checked: each.id === current,
                                listener: () => {
                                    window.open(`/r/document/view/${each.id}`);
                                },
                            });
                        });
                        cm.open(link);
                    } else {
                        Messages.showAutoClose(I18n.get('label.empty_row'));
                    }
                },
            });
            p = p.child;
        }
    }

}
class Button extends UI {

    constructor(model, parent) {
        super('button', parent);
        if (model.icon) {
            new UIArray([
                new Icon(model.icon),
                new Plain(model.name),
            ], this);
        } else {
            this.html(model.name);
        }
        if (model.disabled) {
            this.el.disabled = true;
        }
        if (model.listener) {
            if (model.listener.constructor.name === 'AsyncFunction') {
                model.spin = true;
            }
            this.on('click', event => {
                event.stopPropagation();
                event.preventDefault();
                if (model.spin) {
                    this.spin(model.listener);
                } else {
                    model.listener();
                }
            });
        }
    }

    async spin(handler) {
        this.disable();
        const spinner = new Spinner(this);
        try {
            await handler();
        } finally {
            spinner.remove();
            this.enable();
        }
    }

}

class ButtonPanel extends UI {

    constructor(parent, buttons) {
        super('ui-button-panel', parent);
        if (buttons) {
            if (Array.isArray(buttons)) {
                buttons.forEach(each => {
                    if (each instanceof Button) {
                        this.append(each);
                    } else if (each === 'cancel') {
                        this.cancel();
                    } else {
                        this.button(each);
                    }
                });
            } else {
                this.button(buttons);
            }
        }
    }

    button(buttonModel) {
        return new Button(buttonModel, this);
    }

    cancel(listener) {
        new Link({
            name: I18n.get('label.cancel'),
            listener: event => {
                event.preventDefault();
                if (listener) {
                    listener();
                } else {
                    window.history.back();
                }
            },
        }, this).addClass('cancel');
    }

}

class ZoomButton extends UI {

    static VALUES = [25, 33, 50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500];

    #value = 7;

    constructor(listener, parent) {
        super('ui-zoom-button', parent);
        new Icon({
            icon: 'check_indeterminate_small',
            title: I18n.get('label.zoom_out'),
            listener: () => {
                this.#value = Math.max(0, this.#value - 1);
                setValue();
                listener(ZoomButton.VALUES[this.#value]);
            }
        }, this);
        const label = new UI('strong', this);
        new Icon({
            icon: 'add',
            title: I18n.get('label.zoom_in'),
            listener: () => {
                this.#value = Math.min(ZoomButton.VALUES.length - 1, this.#value + 1);
                setValue();
                listener(ZoomButton.VALUES[this.#value]);
            }
        }, this);

        const setValue = (v) => {
            label.html(`${ZoomButton.VALUES[this.#value]}%`);
        };
        setValue();
    }

    get rate() {
        return ZoomButton.VALUES[this.#value] / 100;
    }

}
class WebCategory extends UI {

    #model;

    constructor(model, parent) {
        super('ui-category', parent);
        this.#model = model;
        this.html(model.name);
    }

    get model() {
        return {
            id: this.#model.id,
            name: this.#model.name,
        };
    }

    selected() {
        return this.hasClass('selected');
    }

    toggle() {
        this.toggleClass('selected');
    }

}

class CategoryTree extends UI {

    #values;

    #listener;

    constructor({ id, values = new Set(), listener, mode = 'FORUM' }, parent) {
        super('ui-category-tree', parent);
        this.#values = values;
        this.#listener = listener;
        this.load(id, mode);
    }

    async load(id, mode) {
        const response = await Http.get(`/r/category/get/${id}/${mode}`);
        const accordion = new Accordion(this);
        if (!this.parent.el.closest('ui-drawer')) {
            accordion.addClass('w-fit', 'min-w-80');
        }
        response.forEach(each => {
            if (each.children && each.children.length) {
                const tree = new Tree(this);
                this.loadTreeItem(tree, each.children);
                accordion.add(each.name, tree, true);
            }
        });
    }

    loadTreeItem(parentNode, values) {
        values.forEach(each => {
            const category = new WebCategory(each);
            if (this.#values.has(each.id)) {
                category.toggle();
            }
            const node = parentNode.add({
                id: each.id,
                name: category,
            }, true);
            if (each.children.length) {
                this.loadTreeItem(node, each.children);
            } else {
                category.on('click', event => {
                    category.toggle();
                    this.#listener(category);
                });
            }
        });
    }

}

class WebCategorySelector extends Panel {

    #id;

    #targetId;

    #listener;

    #callback;

    #panel;

    #values = new Map();

    constructor({ id, editable, targetId, listener, mode, callback }, parent) {
        super({
            name: I18n.get('label.category'),
        }, parent);
        if (editable) {
            this.link({
                name: I18n.get('label.choose_a_category'),
                listener: () => this.category(mode),
            });
        }
        this.#id = id;
        this.#targetId = targetId;
        this.#listener = listener;
        this.#callback = callback;
        this.#panel = new UIArray([], this);
    }

    addCategory(model, selected = true) {
        if (selected) {
            this.#values.set(model.id, new WebCategory(model, this.#panel));
        } else if (this.#values.has(model.id)) {
            this.#values.get(model.id).remove();
            this.#values.delete(model.id);
        }
    }

    category(mode, selectedValues) {
        const drawer = new Drawer({
            title: I18n.get('label.category'),
        });
        new CategoryTree({
            id: this.#id,
            values: selectedValues || this.#values,
            mode,
            listener: category => {
                const model = category.model;
                if (category.selected()) {
                    this.#values.set(model.id, new WebCategory(model, this.#panel));
                } else if (this.#values.has(model.id)) {
                    this.#values.get(model.id).remove();
                    this.#values.delete(model.id);
                }
                if (this.#callback) {
                    this.#callback({
                        id: model.id,
                        name: model.name,
                        selected: category.selected(),
                    });
                    return;
                }
                if (this.#targetId) {
                    Http.post(`/r/category/${category.selected() ? 'select' : 'unselect'}/${this.#targetId}/${model.id}`).then(response => {
                        if (this.#listener) {
                            this.#listener(model, category.selected());
                        }
                    });
                }
            },
        }, drawer);
    }

    get value() {
        if (this.#values.size) {
            const result = [];
            this.#values.forEach((value, key) => {
                result.push(key);
            });
            return result;
        } else {
            return null;
        }
    }

}

class CategoryDrawer {

    constructor({ id }, listener) {
        if (!id) {
            throw new Error('id required');
        }
        if (!listener) {
            throw new Error('listener required');
        }
        const drawer = new Drawer({
            title: I18n.get('label.category'),
        });
        drawer.skeleton(async () => {
            if (!await Http.get(`/r/permission/get/${id}/TASK_CATEGORY_EDIT`)) {
                new Message(I18n.get('label.task_edit_permission_denied'), drawer);
                return;
            }

            const selectedCategories = new Map();
            (await Http.get(`/r/task/get_categories/${id}`)).forEach(each => selectedCategories.set(each.id, each));
            new CategoryTree({
                id: id,
                values: selectedCategories,
                mode: 'DESK',
                listener: async category => {
                    const model = category.model;
                    await Http.post(`/r/category/${category.selected() ? 'select' : 'unselect'}/${id}/${model.id}`);
                    listener(model, category.selected());
                },
            }, drawer);
        });
    }

}
class Checkbox extends UI {

    constructor(model, parent) {
        super('label', parent);
        const input = new UI('input', this).attr('type', 'checkbox');
        if (model.value) {
            input.el.value = model.value;
        }
        if (model.label) {
            if (model.label instanceof UI) {
                this.append(model.label);
            } else {
                this.append(document.createTextNode(model.label));
            }
        }
        if (model.checked) {
            input.el.checked = true;
        }
        if (model.disabled) {
            input.el.disabled = true;
        }
        if (model.listener) {
            input.on('change', model.listener);
        }
    }

}
class WebClipboard {

    copy(text, showMessage = true) {
        if (typeof text === 'function') {
            text = text();
        }

        let type;
        if (text.text) {
            type = text.type;
            text = text.text;
        }
        if (typeof text === 'function') {
            text = text();
        } else if (text instanceof HTMLElement) {
            const clone = text.cloneNode(true);
            clone.querySelectorAll('p.caption, span.mark, span.callout, sup.footnote, ins, ui-icon').forEach(each => each.remove());
            clone.innerHTML = clone.innerHTML.replaceAll('&nbsp;', ' ');
            text = clone.textContent;
        }
        if (window.clipboardData) {
            window.clipboardData.setData('Text', text);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement("textarea");
            textArea.style.border = 'none';
            textArea.style.bottom = '0';
            textArea.style.boxShadow = 'none';
            textArea.style.height = '1px';
            textArea.style.outline = 'none';
            textArea.style.padding = 'none';
            textArea.style.position = 'fixed';
            textArea.style.top = '0';
            textArea.style.width = '1px';
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
            } finally {
                document.body.removeChild(textArea);
            }
        }

        if (type) {
            if (type === 'code') {
                text = I18n.get('label.code');
            } else if (type === 'link') {
                text = I18n.get('label.link');
            }
        }
        if (showMessage) {
            Messages.showAutoClose(text.length > 20 ? I18n.get('label.text_copied_to_clipboard') : I18n.get('label.copy_to_clipboard', text));
        }
    }

}
class NativeColorPicker extends Field {

    #input;

    constructor(model, parent) {
        super(model, parent);
        this.addClass('native_color_field');
        this.#input = this.child('input').attr('type', 'color');
        this.#input.attr('id', `_${_FIELD_ID}`);
        if (model.value) {
            this.value = model.value;
        } else {
            this.value = '#fffffe';
        }
        if (!model.change && model.input) {
            model.change = model.input;
        }
        if (model.change) {
            this.#input.on('input', () => model.change(this.value));
        }
        if (model.showPalette) {
            this.#input.on('click', event => {
                event.preventDefault();
                new ClassicColorPalette({
                    value: this.value,
                    change: v => {
                        this.value = v;
                        if (model.change) {
                            model.change(this.value);
                        }
                    },
                }, new FloatingPanel());
            });
        }
        new Link({
            name: I18n.get('label.remove'),
            listener: event => {
                event.preventDefault();
                this.value = '#fffffe';
                if (model.change) {
                    model.change('');
                }
            }
        }, this);
    }

    get value() {
        const result = this.#input.el.value;
        if (result === '#fffffe') {
            return null;
        } else {
            return result;
        }
    }

    set value(value) {
        if (value && value.startsWith('rgb')) {
            value = ColorUtils.toHex(value);
        }
        this.#input.el.value = value;
    }

}

class SimpleColorField extends Field {

    #selector;

    constructor(model, parent) {
        super(model, parent);
        this.addClass('simple_color_field');
        this.#selector = new SimpleColorSelector({
            listener: (color, selected) => {
                if (model.input) {
                    model.input(color, selected);
                }
            },
        }, this);
    }

    get value() {
        return this.#selector.color;
    }

    set value(value) {
        this.#selector.color = value;
    }

}

class WebColorSelector extends UI {

    constructor({ listener }, parent) {
        super('ui-flex-panel');
        new PageHeader({
            icon: 'color_lens',
            title: I18n.get('label.color'),
            subtitle: new Link({
                name: 'Material Design Color',
                href: 'https://material.io/resources/color/',
                openInNew: true,
            }),
        }, this);
        new ColorPalette(listener, this);
    }

}

class SimpleColorSelector extends UI {

    #color;

    #remover;

    #listener;

    constructor({
        color,
        listener,
    }, parent) {
        super('ui-color-picker', parent);
        this.#listener = listener;
        if (listener) {
            this.on('click', () => {
                const fp = new FloatingPanel();
                new ColorPalette((c, selected) => {
                    this.color = selected ? c.id : null;
                    if (listener) {
                        listener(c, selected);
                    }
                    fp.close();
                }, fp, this.#color).css({
                    maxWidth: '23rem',
                    padding: '1rem',
                });
                fp.open(this);
            });
        }
        if (color) {
            this.color = color;
        }
    }

    get color() {
        return this.#color;
    }

    set color(color) {
        this.#color = color;
        this.el.dataset.color = color || '';
        if (color) {
            if (!this.#remover) {
                this.#remover = new Icon({
                    icon: 'close',
                    title: I18n.get('label.remove'),
                    listener: event => {
                        event.stopPropagation();
                        this.color = null;
                        if (this.#listener) {
                            this.#listener(null, false);
                        }
                    },
                }, this).css({
                    position: 'absolute',
                    left: '2.25rem',
                    top: 0,
                }).addClass('circle-small', 'hover:gray');
            } else {
                this.#remover.show();
            }
        } else if (this.#remover) {
            this.#remover.hide();
        }
    }

}

class ColorPalette extends UI {

    #listener;

    #check

    constructor(listener, parent, color) {
        super('ui-color-palette', parent);
        this.#listener = listener;
        this.#check = new Icon('check');
        this.load(color);
    }

    async load(color) {
        const colors = await Http.get('/r/color/get');
        colors.forEach(each => {
            this.child('span', span => {
                span.attr('title', each.name);
                span.el.style.backgroundColor = each.color;
                if (color === each.id) {
                    span.addClass('selected');
                    span.append(this.#check);
                }
                if (this.#listener) {
                    span.on('click', () => {
                        span.toggleClass('selected');
                        this.#listener(each, span.hasClass('selected'));
                    });
                }
            });
        });
    }

}

class ClassicColorPalette extends UI {

    constructor(model, parent) {
        super('ui-classic-color-picker', parent);
        const colorss = [
            ['255, 255, 255', '255, 204, 204', '254, 204, 153', '255, 255, 153', '255, 255, 204', '153, 255, 153', '153, 255, 255', '204, 255, 255',
                '204, 204, 255', '255, 204, 255'],
            ['204, 204, 204', '255, 102, 102', '255, 153, 102', '255, 255, 102', '255, 255, 51', '102, 255, 153', '51, 255, 255', '102, 255, 255',
                '153, 153, 255', '255, 153, 255'],
            ['192, 192, 192', '255, 0, 0', '255, 153, 0', '255, 204, 102', '255, 255, 0', '51, 255, 51', '102, 204, 204', '51, 204, 255',
                '102, 102, 204', '204, 102, 204'],
            ['153, 153, 153', '204, 0, 0', '255, 102, 0', '255, 204, 51', '255, 204, 0', '51, 204, 0', '0, 204, 204', '51, 102, 255', '102, 51, 255',
                '204, 51, 204'],
            ['102, 102, 102', '153, 0, 0', '204, 102, 0', '204, 153, 51', '153, 153, 0', '0, 153, 0', '51, 153, 153', '51, 51, 255', '102, 0, 204',
                '153, 51, 153'],
            ['51, 51, 51', '102, 0, 0', '153, 51, 0', '153, 102, 51', '102, 102, 0', '0, 102, 0', '51, 102, 102', '0, 0, 153', '51, 51, 153',
                '102, 51, 102'],
            ['0, 0, 0', '51, 0, 0', '102, 51, 0', '102, 51, 51', '51, 51, 0', '0, 51, 0', '0, 51, 51', '0, 0, 102', '51, 0, 153', '51, 0, 51']];

        const table = new UI('table', this);
        colorss.forEach(colors => {
            const tr = new UI('tr', table);
            colors.forEach(color => {
                const td = new UI('td', tr);
                td.css({
                    backgroundColor: `rgb(${color})`,
                });
                td.on('click', () => {
                    const v = ColorUtils.toHex(color);
                    input.el.value = v;
                    if (model.change) {
                        model.change(v);
                    }
                });
            });
        });

        const input = new UI('input', this).attr('type', 'color').attr('value', model.value);
        if (model.change) {
            input.on('input', () => model.change(input.el.value));
        }
        new UIArray([
            input,
            new Link({
                name: I18n.get('label.other_color'),
                listener: () => {
                    input.el.click();
                },
            }),
        ], this);
    }

}

const ColorUtils = {

    load: async () => {
        ColorUtils.colors = await Http.get('/r/color/all', true);
    },
    toHex: (rgb) => {
        let result = '#';
        rgb.replaceAll('rgb(', '').replaceAll('rgba(', '').replaceAll(')', '').replaceAll(',', '').split(' ').forEach((each, i) => {
            if (i < 3) {
                const v = ColorUtils.componentToHex(Number(each));
                result += v;
            }
        });
        return result;
    },

    componentToHex: (c) => {
        const hex = c.toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    },

    getColor: (color, type = '500') => {
        return ColorUtils.colors[color][type];
    }

}
class CommentPanel extends Panel {

    #countSpan;

    #count;

    #category;

    #subject;

    #type;

    constructor({ category, subject, type = 'BOOK' }, parent) {
        super({}, parent);
        this.addClass('comment_panel');
        this.#category = category;
        this.#subject = subject;
        this.#type = type;
        this.skeleton(async () => {
            const { signonRequired, count, comments } = await Http.get(`/r/comment/load/${this.#subject}`);
            this.#countSpan = new UI('span');
            this.name = this.#countSpan;
            if (signonRequired) {
                const link = this.link({
                    name: I18n.get('label.signon_required_to_comment'),
                    listener: event => {
                        event.preventDefault();
                        new Signout('comment').handle(() => {
                            link.remove();
                            this.link({
                                name: I18n.get('message.write_comment'),
                                listener: this.writeComment.bind(this),
                            });
                        });
                    },
                });
            } else {
                this.link({
                    name: I18n.get('message.write_comment'),
                    listener: this.writeComment.bind(this),
                });
            }
            this.changeCount(count);
            comments.forEach(each => {
                new Comment(each, this);
            });
        }, 3);
    }

    get count() {
        return this.#count;
    }

    validate() {
        if (this.query('ui-comment-form')) {
            Messages.showAutoClose(I18n.get('label.comment_box_opened'));
            return false;
        } else {
            return true;
        }
    }

    writeComment() {
        if (this.validate()) {
            new CommentCreateForm(this);
        }
    }

    async create(param, form) {
        param.category = this.#category;
        param.subject = this.#subject;
        param.type = this.#type;
        const response = await Http.post(`/r/comment/create`, param);
        form.remove();
        this.changeCount(this.#count + 1);
        new Comment(response, this);
    }

    async reply(comment, param, form) {
        const response = await Http.post(`/r/comment/reply/${comment.id}`, param);
        form.remove();
        this.changeCount(this.#count + 1);
        comment.addReply(new Comment(response));
    }

    async remove(comment) {
        if (I18n.confirm('label.confirm_remove')) {
            const response = await Http.post(`/r/comment/remove/${comment.id}`);
            if (response && response.state === 'REMOVED') {
                comment.refresh({
                    content: `<del>${I18n.get('label.removed_comment')}</del>`,
                });
            } else {
                comment.remove();
                this.changeCount(this.#count - 1);
            }
        }
    }

    changeCount(count) {
        this.#count = count;
        this.#countSpan.html(I18n.get('label.there_are_comments', count));
    }

}

class Comment extends UI {

    #model;

    #commentPanel;

    #replyPanel;

    constructor(model, commentPanel) {
        super('ui-comment', commentPanel);
        this.#model = model;
        this.#commentPanel = commentPanel;
        new UIArray([
            new WebUser(model.creator),
            new Icon('keyboard_arrow_down'),
            new DateTime(model.time),
        ], this).el.style.color = 'var(--gray-font-color)';
        if (model.state === 'SPAM') {
            this.child('div').html(`<del>${I18n.get('label.spam_comment')}</del>`);
        } else {
            this.child('div').html(model.state === 'REMOVED' ? `<del>${I18n.get('label.removed_comment')}</del>` : model.content);
        }
        if (commentPanel || model.editable) {
            new UIArray([
                () => {
                    if (commentPanel) {
                        return new Link({
                            name: I18n.get('label.reply'),
                            listener: event => {
                                if (!this.#replyPanel) {
                                    this.#replyPanel = new UI('ui-comment-replies', this);
                                }
                                if (commentPanel.validate()) {
                                    new CommentReplyForm(this, this.#commentPanel, this.#replyPanel);
                                }
                            },
                        });
                    }
                },
                () => {
                    if (model.editable) {
                        return [
                            new Link({
                                name: I18n.get('label.update'),
                                listener: () => {
                                    if (this.#commentPanel.validate()) {
                                        new CommentUpdateForm(model, this);
                                    }
                                },
                            }),
                            new Link({
                                name: I18n.get('label.remove'),
                                listener: () => this.#commentPanel.remove(this),
                            }),
                        ];
                    }
                },
            ], this, true);
        }
        if (model.replies) {
            this.#replyPanel = new UI('ui-comment-replies', this);
            model.replies.forEach(each => {
                const reply = new Comment(each);
                reply.manager = this.commentPanel;
                this.addReply(reply);
            });
        }
    }

    get id() {
        return this.#model.id;
    }

    get manager() {
        return this.#commentPanel;
    }

    set manager(manager) {
        this.#commentPanel = manager;
    }

    addReply(reply) {
        reply.manager = this.#commentPanel;
        this.#replyPanel.append(reply);
    }

    refresh({ content }) {
        this.#model.content = content;
        this.query('div').innerHTML = content;
        this.show();
    }

}

class CommentForm extends UI {

    #div;

    constructor(model, parent) {
        super('div', parent);
        this.#div = this.child('div').attr('contentEditable', true).addClass('mouseover-scrollbar');
        if (model.content) {
            this.#div.html(model.content);
        }
        const buttonPanel = new ButtonPanel(this);
        new Icon({
            icon: 'image',
            title: I18n.get('label.add_image'),
            listener: () => this.addImage(),
        }, buttonPanel);

        buttonPanel.button({
            name: I18n.get('label.save'),
            listener: () => model.save(this.#div.el.innerHTML),
        });
        buttonPanel.cancel(() => model.cancel());
        this.focus();
    }

    addImage() {
        const selection = window.getSelection();
        let range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        let contentEditable = false;
        let el = range.startContainer;
        while (el) {
            if (el.contentEditable === 'true') {
                contentEditable = true;
                break;
            }
            el = el.parentElement;
        }
        if (!contentEditable) {
            range = null;
        }
        new ImageUploader({
            listener: id => {
                const image = new UI('img').attr('src', `/r/image/get/${id}`);
                if (range) {
                    range.insertNode(image.el);
                    range.collapse();
                } else {
                    this.#div.append(image);
                }
            },
        });
    }

    focus() {
        this.#div.el.focus();
    }

}

class CommentCreateForm extends UI {

    constructor(parent) {
        super('ui-comment-form', parent);
        new CommentForm({
            save: content => {
                parent.create({
                    content,
                }, this);
            },
            cancel: () => {
                this.remove();
            },
        }, this);
    }

}

class CommentUpdateForm extends UI {

    constructor(model, parent) {
        super('ui-comment-form');
        const form = new CommentForm({
            content: model.content,
            save: content => {
                Http.post(`/r/comment/update/${model.id}`, {
                    content,
                }).then(response => {
                    parent.refresh(response);
                    this.remove();
                });
            },
            cancel: () => {
                parent.show();
                this.remove();
            },
        }, this);
        parent.hide();
        parent.appendAfter(this);
        form.focus();
    }

}

class CommentReplyForm extends UI {

    constructor(comment, commentPanel, parent) {
        super('ui-comment-form', parent);
        new CommentForm({
            save: content => {
                commentPanel.reply(comment, {
                    content,
                }, this);
            },
            cancel: () => {
                this.remove();
            },
        }, this);
    }

}
const ContextMenuType = {

    LINK: Symbol(),

    MORE: Symbol(),

    SEPARATOR: Symbol(),

};

class ContextMenu extends UI {

    #menus = [];

    #loader;

    #filter;

    #value;

    constructor(model = {}, parent) {
        super(model.type === ContextMenuType.LINK ? 'a' : 'ui-icon', parent);
        this.#loader = model.loader;
        this.#filter = model.filter;
        this.#value = model.value;
        if (model.type === ContextMenuType.LINK) {
            this.html(model.name);
            this.el.href = '#';
        } else if (model.type === ContextMenuType.MORE) {
            if (!model.icon) {
                this.addClass('web_context_menu');
            }
            this.html('more_horiz');
        }
        this.on('click', event => {
            event.preventDefault();
            event.stopPropagation();
            this.open(event.x, event.y);
        });
    }

    add(menu) {
        this.#menus.push(menu);
    }

    addSeparator() {
        this.#menus.push(ContextMenuType.SEPARATOR);
    }

    open(x, y, closeListener) {
        const opened = document.querySelector('ui-context-menu');
        if (opened) {
            opened.parentElement.remove();
        }

        if (!this.#menus.length && this.#loader) {
            this.#loader(this, this.#value);
        }
        const floatingPanel = new FloatingPanel().open(x, y, 'ContextMenu');

        let selectedItem;
        const items = [];
        const contextMenu = new UI('ui-context-menu', floatingPanel);
        this.#menus.forEach(each => {
            if (each === ContextMenuType.SEPARATOR) {
                new UI('hr', contextMenu);
            } else {
                if (this.#filter) {
                    each.disabled = !this.#filter(each);
                }
                const menu = new ContextMenuItem(each, contextMenu);
                items.push(menu);
                if (each.selected) {
                    selectedItem = menu;
                }
            }
        });
        contextMenu.attr('tabindex', 0);
        contextMenu.on('keydown', event => {
            event.stopPropagation();
            if (items.length < 2) {
                return;
            }
            const { key } = event;
            if (key === 'Escape') {
                floatingPanel.close();
                if (closeListener) {
                    closeListener();
                }
                return;
            } else if (key === 'Enter') {
                if (selectedItem) {
                    const event = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true
                    });
                    selectedItem.el.dispatchEvent(event);
                }
                return;
            }

            let item;
            if (key === 'ArrowUp') {
                if (selectedItem) {
                    let i = items.indexOf(selectedItem);
                    if (i === 0) {
                        event.preventDefault();
                        item = items[items.length - 1];
                        const el = floatingPanel.el;
                        el.scrollTop = el.scrollHeight;
                    } else {
                        item = items[i - 1];
                    }
                } else {
                    item = items[0];
                }
            } else if (key === 'ArrowDown') {
                if (selectedItem) {
                    let i = items.indexOf(selectedItem);
                    if (i === items.length - 1) {
                        event.preventDefault();
                        item = items[0];
                        floatingPanel.el.scrollTop = 0;
                    } else {
                        item = items[i + 1];
                    }
                } else {
                    item = items[0];
                }
            }
            if (item) {
                if (selectedItem) {
                    selectedItem.removeClass('selected');
                }
                (selectedItem = item).addClass('selected');
            }
        });
        contextMenu.focus();
        const { top, height } = floatingPanel.el.getBoundingClientRect();
        if (top + height > window.innerHeight) {
            floatingPanel.el.style.top = `${window.innerHeight - height - 8}px`;
        }
    }

}

class ContextMenuItem extends UI {

    #checked;

    constructor(each, contextMenu) {
        super('p', contextMenu);
        if (each.id) {
            this.el.dataset.id = each.id;
            if (!each.name) {
                each.name = I18n.get(`label.${each.id}`);
            }
        }
        if (each.checked) {
            this.#checked = true;
            new Icon('check', this);
            if (each.name instanceof UI) {
                this.append(each.name);
            } else {
                this.append(document.createTextNode(each.name));
            }
        } else {
            this.html(each.name);
        }
        if (each.independent) {
            this.addClass('independent');
        }
        if (each.selected) {
            this.addClass('selected');
        }
        if (each.disabled) {
            this.addClass('disabled');
        } else {
            this.on('click', () => {
                contextMenu.parent.close();
                // 확인창을 보여줄 때 FloatingPanel이 계속 보이지는 문제를 해결하기 위해서
                // setTimeout 사용
                setTimeout(() => {
                    if (each.listener) {
                        each.listener(this);
                    }
                }, 10);
            });
        }
    }

    checked() {
        return this.#checked;
    }

}
class DatePicker extends UI {

    #value;

    #listener;

    #clearIcon;

    constructor(model = {}, parent) {
        super('ui-date-picker', parent);
        this.child('span').plain(I18n.get('label.wf_date_picker'));
        if (model.blank) {
            this.#clearIcon = new Icon({
                icon: 'close',
                listener: (event) => {
                    event.stopPropagation();
                    this.#value = null;
                    this.query('span').innerHTML = '';
                    this.#clearIcon.hide();
                },
            }, this).css({ fontSize: '1rem' });
            this.#clearIcon.hide();
        } else {
            this.value = new Date();
        }
        new Icon('calendar_today', this);
        this.on('click', () => {
            const modal = new Modal({
                title: DateUtils.format(this.#value || new Date()),
            });
            modal.addComponent(new DateCalendar({
                date: this.#value,
                listener: (value) => {
                    this.value = value;
                    modal.close();
                    if (this.#listener) {
                        this.#listener(this.value);
                    }
                },
            }));
        });
    }

    setListener(listener) {
        this.#listener = listener;
    }

    get value() {
        if (this.#value) {
            return DateUtils.format(this.#value).replaceAll('-', '');
        }
    }

    set value(date) {
        if (!date) {
            return;
        }
        if (this.#clearIcon) {
            this.#clearIcon.show();
        }
        try {
            if (typeof date === 'string') {
                date = date.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
                date = new Date(date);
            }
            this.#value = date;
            this.query('span').innerHTML = DateUtils.format(this.#value);
        } catch (ignore) {
            console.error(ignore);
        }
    }

    getDate() {
        const result = new Date(this.#value);
        result.setHours(0);
        result.setMinutes(0);
        result.setSeconds(0);
        result.setMilliseconds(0);
        return result;
    }

    static format(date) {
        return date.toLocaleDateString('sv-SE');
    }

}

class DateRangePicker extends UI {

    #from;

    #to;

    constructor(model, parent) {
        super('ui-date-range-picker', parent);
        this.#from = new DatePicker({}, this);
        const today = new Date();
        today.setDate(today.getDate() - model.range);
        this.#from.value = today;
        this.#to = new DatePicker({}, this);
    }

    get value() {
        return {
            from: this.#from.value,
            to: this.#to.value,
        }
    }

}

class DateCalendar extends UI {

    #value;

    #date;

    #listener;

    #month;

    #table;

    constructor({ date = new Date(), listener }) {
        super('ui-date-calendar');
        this.addClass('flex', 'flex-col', 'gap-4');
        this.#value = date;
        this.#date = new Date(date);
        this.#listener = listener;
        this.child('div', div => {
            new Icon({
                icon: 'keyboard_arrow_left',
                listener: () => this.changeMonth(-1),
            }, div).addClass('size-3');

            this.#month = new UI('span').addClass('text-base');
            new UIArray([
                this.#month,
                new Icon({
                    icon: 'arrow_drop_down_circle',
                    listener: (event, icon) => {
                        const cm = new ContextMenu();
                        for (let i = new Date().getFullYear(); i > 2010; i--) {
                            cm.add({
                                'name': i,
                                listener: () => this.changeYear(i),
                            });
                        }
                        cm.open(icon);
                    },
                }).addClass('size-3'),
            ], div);
            new Icon({
                icon: 'keyboard_arrow_right',
                listener: () => this.changeMonth(1),
            }, div).addClass('size-3');
        }).addClass('flex', 'gap-8', 'justify-center', 'items-center');
        this.changeMonth(0);
    }

    changeYear(year) {
        this.#date.setFullYear(year);
        this.#month.html(DateUtils.format(this.#date).substring(0, 7));
        this.display(new Date(this.#date));
    }

    changeMonth(change) {
        const date = new Date(this.#date);
        date.setDate(1);
        date.setMonth(this.#date.getMonth() + change);

        const year = date.getFullYear();
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
            daysInMonth[0] = 29;
        }
        if (this.#date.getDate() > daysInMonth[date.getMonth()]) {
            this.#date.setDate(daysInMonth[date.getMonth()]);
        }
        this.#date.setMonth(this.#date.getMonth() + change);
        this.#month.html(DateUtils.format(this.#date).substring(0, 7));
        this.display(new Date(this.#date));
    }

    display(date) {
        if (this.#table) {
            this.#table.remove();
        }
        date.setDate(1);

        const year = date.getFullYear();
        const month = date.getMonth();
        this.#table = new UI('table', this);
        this.#table.child('tr', tr => {
            ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].forEach((each, i) => new UI('th', tr).plain(each));
        });

        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
            daysInMonth[1] = 29;
        }
        const today = new Date();
        const day = this.#date.getDate();
        const weeks = (daysInMonth[month] + date.getDay()) / 7;
        let d = -date.getDay() + 1;
        for (let i = 0; i < weeks; i++) {
            let tr = new UI('tr', this.#table);
            for (let j = 0; j < 7; j++) {
                const td = new UI('td', tr);
                if (d > 0 && d <= daysInMonth[month]) {
                    let value = d;
                    const span = new UI('span', td);
                    if (day === value && year === this.#value.getFullYear() && month === this.#value.getMonth()) {
                        span.addClass('bg-selected');
                    }
                    if (value === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                        span.plain(I18n.get('label.today')).css({ color: 'var(--blue)' });
                        span.addClass('font-bold');
                        span.attr('title', value);
                    } else {
                        span.plain(value);
                    }
                    td.on('click', () => {
                        const v = new Date(date);
                        v.setDate(value);
                        this.#listener(v);
                    });
                }
                d++;
            }
        }
    }

}

class YearPicker extends UI {

    #date;

    constructor({ listener }, parent) {
        super('ui-year-picker', parent);
        this.addClass('flex', 'gap-2');
        this.#date = new Date();
        const f = (diff) => {
            const y = this.year + diff;
            this.#date.setFullYear(y);
            year.plain(y);
            listener(y);
        };
        new Icon({
            icon: 'arrow_back_ios',
            listener: () => f(-1),
        }, this);
        const year = new UI('span', this).plain(this.year);
        new Icon({
            icon: 'arrow_forward_ios',
            listener: () => f(1),
        }, this);
    }

    get year() {
        return this.#date.getFullYear();
    }

}
class Drawer extends UI {

    #closeListener;

    #block;

    #width;

    constructor({ title, icon = 'article', actions, subtitle, closeListener, block, width = '30rem' }) {
        super('ui-drawer', document.body);
        this.#closeListener = closeListener;
        this.#block = block;
        this.#width = width;
        this.addClass('mouseover-scrollbar');
        this.css({
            zIndex: ++window.modalManagerCount,
        });
        this.slide();
        if (title) {
            const header = new PageHeader({
                icon,
                title,
                subtitle: subtitle || actions,
            }, this);
            new Icon({
                icon: 'close',
                listener: this.close.bind(this),
            }, header);
        }
        if (this.#block) {
            const app = document.querySelector('ui-application');
            app.style.backgroundColor = 'white';
            app.style.opacity = '0.5';
            app.style.pointerEvents = 'none';
        }
    }

    close() {
        this.el.style.width = 0;
        const end = event => {
            this.remove();
            this.off('transitionend', end);
        };
        this.on('transitionend', end);

        if (this.#closeListener) {
            this.#closeListener();
        }
        if (this.#block) {
            const app = document.querySelector('ui-application');
            app.style.removeProperty('background-color');
            app.style.removeProperty('opacity');
            app.style.removeProperty('pointer-events');
        }
    }

    reopen() {
        document.body.append(this.el);
        this.slide();
    }

    slide() {
        setTimeout(() => {
            if (document.body.dataset.moduleType === 'EDITOR') {
                const { x, width } = document.getElementById('element_panel').getBoundingClientRect();
                let w = (document.body.clientWidth - x - width) / 16 - 3;
                this.css({
                    width: `${Math.max(30, w)}rem`,
                });
            } else {
                this.css({
                    width: this.#width,
                });
            }
        }, 100);
    }

}

const DrawerManager = {

    drawers: new Map(),

    current: null,

    toggle: (id, loader) => {
        const drawers = DrawerManager.drawers;
        let current = DrawerManager.current;
        if (current === id) {
            const drawer = drawers.get(id);
            if (drawer.el.parentElement) {
                drawer.close();
                DrawerManager.current = null;
            } else {
                // 사용자가 Drawer를 직접 닫았을 때
                drawer.reopen();
            }
        } else {
            let drawer = current && drawers.get(current);
            if (drawer) {
                drawer.close();
            }
            if (drawers.has(id)) {
                drawer = drawers.get(id);
                drawer.reopen();
            } else {
                drawer = loader();
                drawers.set(id, drawer);
            }
            DrawerManager.current = id;
        }
    },


}
const DropdownType = {
    TREE: Symbol(),
    CONTEXT_MENU: Symbol(),
}

class Dropdown extends UI {

    #link;

    #value;

    #values;

    #type;

    #placeholder;

    #filter;

    constructor({ value, values, listener, placeholder, filter, type = DropdownType.CONTEXT_MENU, }, parent) {
        super('ui-dropdown', parent);
        this.#type = type;
        this.#placeholder = placeholder;
        this.#filter = filter;
        let name;
        for (let i = 0; i < values.length; i++) {
            let each = values[i];
            if (typeof each === 'string') {
                values[i] = {
                    name: I18n.get(`label.${each}`),
                    value: each,
                };
            } else if (!each.value && each.id) {
                each.value = each.id;
            }
        }
        this.#values = values;

        if (value) {
            const item = values.find(each => each.value === value);
            if (item) {
                this.#value = value;
                name = item.name;
            }
        }
        if (!this.#value && placeholder) {
            name = placeholder;
        }
        this.#link = new Link({
            name,
            listener: () => { },
        }, this);
        if (name === placeholder) {
            this.addClass('unselected');
        }
        new Icon({
            icon: 'expand_more',
        }, this);
        this.on('click', () => this.open(values, listener, placeholder));
    }

    open(values, listener, placeholder) {
        if (this.#type == DropdownType.CONTEXT_MENU) {
            const cm = new ContextMenu();
            values.forEach(({ name, value, children }) => {
                if (this.#filter && !this.#filter(value)) {
                    return;
                }
                cm.add({
                    name,
                    checked: value === this.#value,
                    listener: () => {
                        if (this.#value === value) {
                            if (placeholder) {
                                this.#link.html(placeholder);
                                this.addClass('unselected');
                                this.#value = null;
                            } else {
                                return;
                            }
                        } else {
                            if (name instanceof UI) {
                                this.#link.clear();
                                this.#link.append(name);
                            } else {
                                this.#link.html(name);
                            }
                            this.#value = value;
                            this.removeClass('unselected');
                        }
                        if (listener) {
                            listener(this.#value);
                        }
                    }
                });
            });
            cm.open(this.#link);
        } else if (this.#type == DropdownType.TREE) {
            const fp = new FloatingPanel();
            const tree = new Tree(fp);
            tree.css({
                margin: '.5rem 1rem .5rem .5rem',
                paddingRight: '.5rem',
            });
            const add = (node, items) => {
                items.forEach(({ name, value, children }) => {
                    let childNode;
                    if (value) {
                        childNode = node.add({
                            id: value,
                            name,
                            listener: () => {
                                if (this.#value === value) {
                                    this.#link.html(placeholder);
                                    this.#value = null;
                                    this.addClass('unselected');
                                } else {
                                    if (name instanceof UI) {
                                        this.#link.clear();
                                        this.#link.append(name);
                                    } else {
                                        this.#link.html(name);
                                    }
                                    this.#value = value;
                                    this.removeClass('unselected');
                                }
                                if (listener) {
                                    listener(this.#value);
                                }
                                fp.close();
                            },
                        }, true);
                    } else {
                        childNode = node.add({
                            id: value,
                            name,
                        }, true);
                    }
                    if (children) {
                        add(childNode, children);
                    }
                });
            }
            add(tree, values);
            tree.select(this.#value);
            fp.open(this.#link);
        }
    }

    get value() {
        return this.#value;
    }

    set value(value) {
        this.#value = value;
        const item = WebUtils.findValue(value, this.#values);
        if (item) {
            const name = item.name;
            if (name instanceof UI) {
                this.#link.clear();
                this.#link.append(name);
            } else {
                this.#link.html(name);
            }
            this.removeClass('unselected');
        } else {
            if (this.#placeholder) {
                this.#link.html(this.#placeholder);
            } else {
                this.#link.clear();
            }
            this.addClass('unselected');
        }
    }

}
class EntryPanel extends UI {

    constructor(model, parent) {
        super('ui-entry-panel', parent);
        if (model.name) {
            new UI('h1', this).plain(model.name);
        }
        this.addEntries(new UI('dl', this), model.entries);
    }

    addEntries(dl, entries) {
        entries.forEach(each => {
            new UI('dt', dl).plain(each.name);
            new UI('dd', dl).html(each.description);
        });
    }

}
window.ErrorPageLoader = class {

    constructor(app, parameter) {
        app.add(new ErrorFragmentPage(parameter));
    }

}

window.loadError = parameter => {
    new ErrorFragmentPage(parameter,  Applications.getApplication().main);
}

class ErrorFragmentPage extends UI {

    constructor(parameter, parent) {
        super('ui-app-message', parent);
        if (parameter.type === 'ERROR') {
            new Icon({ icon: 'error' }, this).addClass('color-red');
        } else {
            new Icon({ icon: 'info' }, this);
        }
        if (parameter.message) {
            new Message(parameter.message, this);
        }
        if (parameter.loginRequired) {
            new UIArray([
                new Plain(parameter.path, this),
                new Link({
                    name: I18n.get('label.login'),
                    href: `/r/signon/login?path=${parameter.path}`,
                }),
            ], this);
        } else if (parameter.path) {
            new Plain(parameter.path, this);
        }
        if (parameter.trace) {
            new Trace(parameter.trace, this);
        }
        if (parameter.showProgress) {
            new UI('progress', this);
        }
    }
}
class Favorite extends UI {

    #id;

    #type;

    #icon;

    constructor({ id, type, listener, on, }, parent) {
        super('ui-favorite', parent);
        this.#id = id;
        this.#type = type;
        this.#icon = new Icon({ icon: 'star', }, this);
        if (on === true) {
            this.configure(true, listener);
        } else if (on === false) {
            this.configure(false, listener);
        } else {
            Http.get(`/r/favorite/get/${type}/${id}`).then(on => this.configure(on, listener));
        }
    }

    configure(on, listener) {
        this.set(on);
        this.on('click', async () => {
            const action = this.#icon.hasClass('yellow') ? 'unstar' : 'star';
            await Http.get(`/r/favorite/${action}/${this.#type}/${this.#id}`);
            if (listener) {
                listener();
            }
            this.set(action === 'star');
        });
    }

    set(on) {
        if (on) {
            this.#icon.addClass('yellow');
        } else {
            this.#icon.removeClass('yellow');
        }
        this.attr('title', I18n.get(on ? 'label.starred' : 'label.not_starred'));
    }

}

class Watch extends UI {

    #icon;

    constructor({ id, type, listener }, parent) {
        super('ui-watch', parent);
        this.#icon = new Icon({ icon: 'notifications_active', }, this);
        Http.get(`/r/watch/get/${type}/${id}`).then(response => {
            this.set(response);
            this.on('click', async () => {
                const action = this.#icon.hasClass('purple') ? 'unwatch' : 'watch';
                await Http.get(`/r/watch/${action}/${type}/${id}`);
                if (listener) {
                    listener();
                }
                this.set(action === 'watch');
            });
        });
    }

    set(on) {
        if (on) {
            this.#icon.addClass('purple');
        } else {
            this.#icon.removeClass('purple');
        }
        this.attr('title', I18n.get(on ? 'label.watched' : 'label.not_watched'));
    }

}
class CheckboxGroup extends UI {

    #items = new Map();

    /**
     * @param {RadioGroupModel} [model] 
     * @param {UI} [parent]
     */
    constructor(model = { values: [] }, parent) {
        super('ui-checkbox-group', parent);
        model.values.forEach(({ name, value, id, icon }) => {
            value ||= id;
            const item = new UI('span', this);
            if (icon) {
                item.addClass('by_icon');
                new Icon({
                    icon,
                    title: name,
                }, item);
            } else {
                new Plain(name, item);
            }
            item.el.dataset.value = value;
            this.#items.set(value, item);
            item.on('click', () => {
                this.#select(item);
                if (model.input) {
                    model.input(value);
                }
            });
        });
        if (model.layout === 'column') {
            this.addClass('flex', 'flex-col', 'items-start', 'max-h-96');
        }
    }

    /**
     * @param {UI} item 
     */
    #select(item) {
        item.toggleClass('selected');
        if (!item.hasClass('by_icon')) {
            if (item.hasClass('selected')) {
                item.el.prepend(new Icon('check').el);
            } else {
                item.query('ui-icon').remove();
            }
        }
    }

    get value() {
        const result = [];
        [... this.#items.values()].forEach(each => {
            if (each.hasClass('selected')) {
                result.push(each.el.dataset.value);
            }
        });
        return result;
    }

    set value(value = []) {
        if (value && !Array.isArray(value)) {
            if (typeof value === 'string') {
                value = value.split(' ');
            } else {
                value = Object.keys(value);
            }
        }

        value.forEach(each => {
            if (this.#items.has(each)) {
                this.#select(this.#items.get(each));
            }
        });
    }

}

class CheckboxGroupField extends Field {

    #group;

    constructor(model, parent) {
        super(model, parent);
        this.#group = new CheckboxGroup(model, this);
    }

    get value() {
        const result = this.#group.value;
        if (this.required() && !result.length) {
            const div = new UI('div', this);
            div.append(this.#group);
            new Message(I18n.get('message.field_is_required'), div);
            const click = () => {
                div.parent.append(this.#group);
                div.remove();
                this.el.removeEventListener('click', click);
            };
            this.on('click', click);
            throw SyntaxError();
        }
        return result;
    }

    set value(value) {
        this.#group.value = value;
    }

}
class PasswordField extends Field {

    #input;

    constructor(model, parent) {
        super(model, parent);
        if (model.prefix) {
            this.child('span', span => {
                span.child('span').html(model.prefix).el.style.marginRight = '.5rem';
                this.#input = span.child('input');
            });
        } else {
            if (model.description) {
                const valueHolder = new UI('ui-field-value-with-description', this);
                this.#input = new UI('input', valueHolder);
                new Message(model.description, valueHolder);
            } else {
                this.#input = new UI('input', this);
            }
        }
        this.#input.el.type = 'password';
        this.#input.el.autocomplete = 'new-password';
        if (model.input) {
            this.#input.on('input', () => {
                model.input(this.value);
            });
        }
        if (model.change) {
            this.#input.on('input', () => model.change(this.value));
        }
        this.#input.attr('id', `_${_FIELD_ID}`);
    }

    get value() {
        const result = this.#input.el.value;
        if (!result && this.required()) {
            this.#input.attr('placeholder', I18n.get('message.field_is_required'));
            const click = () => {
                this.#input.removeAttr('placeholder');
                this.el.removeEventListener('click', click);
            };
            this.on('click', click);
            throw SyntaxError();
        }
        return result;
    }

    set value(value) {
        this.#input.el.value = value;
    }

    focus() {
        this.#input.el.focus();
    }

    get input() {
        return this.#input;
    }

}
class RadioGroup extends UI {

    /**
     * @type {UI}
     */
    #selected;

    #items = new Map();

    /**
     * @param {RadioGroupModel} [model] 
     * @param {UI} [parent]
     */
    constructor(model = { values: [] }, parent) {
        super('ui-radio-group', parent);
        model.values.forEach(({ name, value, icon, title, id }) => {
            value ||= id;
            const item = new UI('span', this);
            if (icon) {
                new Icon({
                    icon,
                }, item);
            }
            if (name) {
                new Plain(name, item);
            }
            if (title) {
                item.attr('title', title);
            }
            item.el.dataset.value = value;
            this.#items.set(value, item);
            item.on('click', event => {
                this.#select(item);
                if (model.input) {
                    model.input(this.value, event);
                }
            });
            if (value === model.value) {
                this.#select(item);
            }
        });
    }

    /**
     * @param {UI} item 
     */
    #select(item) {
        if (this.#selected) {
            this.#selected.removeClass('selected');
        }
        (this.#selected = item).addClass('selected');
    }

    get value() {
        return this.#selected ? this.#selected.el.dataset.value : undefined;
    }

    set value(value) {
        if (this.#items.has(value)) {
            this.#select(this.#items.get(value));
        }
    }

}

class RadioGroupField extends Field {

    static COUNT = 1;

    #group;

    constructor(model, parent) {
        super(model, parent);
        if (model.description) {
            const valueHolder = new UI('ui-field-value-with-description', this);
            this.#group = new RadioGroup(model, valueHolder);
            new Message(model.description, valueHolder);
        } else {
            this.#group = new RadioGroup(model, this);
        }
    }

    get value() {
        return this.#group.value;
    }

    set value(value) {
        this.#group.value = value;
    }

}

class RadioButton extends UI {

    constructor(model, parent) {
        super('label', parent);
        const input = new UI('input', this).attr('type', 'radio');
        if (model.name) {
            input.el.name = model.name;
        }
        if (model.value) {
            input.el.value = model.value;
        }
        if (model.label) {
            this.append(document.createTextNode(model.label));
        }
        if (model.checked) {
            input.el.checked = true;
        }
        if (model.input) {
            input.on('change', model.input);
        }
    }

}
class Fields extends UI {

    #form;

    constructor(model = {}, parent) {
        super('ui-fields', parent);
        for (const [name, value] of Object.entries(model)) {
            if (name !== 'form') {
                this.add(I18n.get(`label.${WebUtils.underscore(name)}`), value);
            }
        }
        if (model.form) {
            this.#form = model.form;
        }
    }

    get form() {
        return this.#form;
    }

    add(label, value, style) {
        const result = new Field({
            label: label,
            plainValue: value,
        }, this);
        if (style) {
            result.addClass(style);
        }
        return result;
    }

    set type(type) {
        this.el.dataset.type = type;
    }

    field(model, fieldType) {
        this.#form.monitor(model);
        const result = this.#form.add(model, new fieldType(model));
        this.append(result);
        return result;
    }

    plain(model) {
        if (typeof model === 'string') {
            model = { name: model, };
        }
        const result = this.#form.add(model, new Field(model));
        this.append(result);
        return result;
    }

    text(model) {
        this.#form.monitor(model);
        const result = this.#form.add(model, new TextField(model));
        this.append(result);
        return result;
    }

    name() {
        return this.text({
            name: 'name',
            required: true,
        });
    }

    password(model) {
        const result = this.#form.add(model, new PasswordField(model));
        this.append(result);
        return result;
    }

    number(model) {
        this.#form.monitor(model);
        const result = this.#form.add(model, new NumberField(model));
        this.append(result);
        return result;
    }

    unit(model) {
        this.#form.monitor(model);
        const result = this.#form.add(model, new UnitField(model));
        this.append(result);
        return result;
    }

    textarea(model) {
        this.#form.monitor(model);
        const result = this.#form.add(model, new Textarea(model));
        this.append(result);
        return result;
    }

    description() {
        return this.textarea({
            name: 'description',
        });
    }

    dropdown(model) {
        this.#form.monitor(model);
        const result = this.#form.add(model, new DropdownField(model));
        this.append(result);
        return result;
    }

    checkboxGroup(model) {
        this.#form.monitor(model);
        const result = this.#form.add(model, new CheckboxGroupField(model));
        this.append(result);
        return result;
    }

    radioGroup(model) {
        this.#form.monitor(model);
        const result = this.#form.add(model, new RadioGroupField(model));
        this.append(result);
        return result;
    }

    bool(model) {
        this.#form.monitor(model);
        const result = this.#form.add(model, new BoolField(model)).addClass('option');
        this.append(result);
        return result;
    }

    toggle(model) {
        this.#form.monitor(model);
        const result = this.#form.add(model, new ToggleField(model)).addClass('option');
        this.append(result);
        return result;
    }

    language() {
        return this.dropdown({
            name: 'locale',
            required: true,
            loader: () => {
                return Http.get('/r/i18n/get_languages', true);
            },
        });
    }

    date(model) {
        const result = this.#form.add(model, new DateField(model));
        this.append(result);
        return result;
    }

    time(model) {
        const result = this.#form.add(model, new TimeField(model));
        this.append(result);
        return result;
    }

    timeMinute(model) {
        const result = this.#form.add(model, new TimeMinuteField(model));
        this.append(result);
        return result;
    }

    dateTime(model) {
        const result = this.#form.add(model, new DateTimeField(model));
        this.append(result);
        return result;
    }

    image(model = {}) {
        this.#form.monitor(model);
        const result = this.#form.add(model, new ImageField(model));
        this.append(result);
        return result;
    }

    color(model = {}) {
        model.name = model.name || 'color';
        this.#form.monitor(model);
        const result = this.#form.add(model, new SimpleColorField(model));
        this.append(result);
        return result;
    }

    nativeColor(model) {
        this.#form.monitor(model);
        const result = this.#form.add(model, new NativeColorPicker(model));
        this.append(result);
        return result;
    }

    icon(model = {}) {
        model.name = model.name || 'icon';
        const result = this.#form.add(model, new IconField(model));
        this.append(result);
        return result;
    }

    arrowhead(model) {
        const result = this.#form.add(model, new ArrowHeadField(model));
        this.append(result);
        return result;
    }

    document(model = {}) {
        const result = this.#form.add(model, new DocumentField(model));
        this.append(result);
        return result;
    }

    chapter(model = {}) {
        const result = this.#form.add(model, new ChapterField(model));
        this.append(result);
        return result;
    }

}
class FileAttachment extends UI {

    static UPLOAD = Symbol();

    static DOWNLOAD = Symbol();

    static REMOVE = Symbol();

    constructor({ editable, files }, parent) {
        super('ui-file-attachment', parent);
        if (editable) {
            new UIArray([
                new Link({
                    name: I18n.get('label.upload_attachment'),
                    listener: async () => {
                        Http.upload({
                            url: this.link(FileAttachment.UPLOAD),
                            extensions: await Http.get('/r/upload/get_extensions'),
                            listener: response => this.addFile(response, true),
                        }, true);
                    },
                }),
                new Icon('upload'),
            ], this);
        }
        if (files) {
            files.forEach(each => this.addFile(each, editable));
        }
    }

    addFile({ id, name }, editable) {
        const line = new UIArray([
            new Icon({
                icon: 'attach_file',
            }),
            new Link({
                name,
                listener: () => {
                    Http.download(this.link(FileAttachment.DOWNLOAD, id));
                },
            }),
        ], this);
        if (editable) {
            line.link({
                name: I18n.get('label.remove'),
                listener: () => {
                    I18n.confirm('label.confirm_remove', async () => {
                        await Http.post(this.link(FileAttachment.REMOVE, id));
                        line.remove();
                    });
                },
            });
        }
    }

}
class Flex extends UI {

    constructor(option = {}, parent) {
        super('ui-flex', parent);
    }

}
let _FIELD_ID = 0;

class Form extends UI {

    #fields = new Map();

    #monitor;

    constructor(parent, { monitor, focus = true } = {}) {
        super('ui-form', parent);
        this.#monitor = monitor;
        if (focus && !WebUtils.touchSupported()) {
            this.focus();
        }
        this.enableEnter();
    }

    enableEnter() {
        setTimeout(() => {
            if (this.#fields.size > 0) {
                const field = [...this.#fields.values()][0].el;
                const modal = field.closest('ui-modal');
                if (modal) {
                    const button = modal.querySelector('footer button');
                    if (button) {
                        modal.addEventListener('keyup', ({ key, target }) => {
                            if (key === 'Enter' && target instanceof HTMLInputElement) {
                                button.click();
                            }
                        });
                    }
                } else {
                    const page = field.closest('ui-page');
                    if (page) {
                        const button = page.querySelector('ui-button-panel button');
                        if (button) {
                            page.tabIndex = 10000;
                            page.addEventListener('keyup', ({ key, target }) => {
                                if (key === 'Enter' && target instanceof HTMLInputElement) {
                                    button.click();
                                }
                            });
                        }
                    }
                }
            }
        }, 500);
    }

    monitor(model) {
        if (this.#monitor) {
            const input = model.input;
            model.input = v => {
                this.#monitor(v);
                if (input) {
                    input(v);
                }
            };
        }
    }

    add(model, field) {
        this.#fields.set(model.name, field);
        return field;
    }

    get parameter() {
        let errorHappend = false;
        const result = {};
        this.#fields.forEach((field, name) => {
            try {
                if (field.value !== undefined) {
                    result[name] = field.value;
                }
            } catch (e) {
                errorHappend = true;
            }
        });
        return errorHappend ? null : result;
    }

    set parameter(parameter) {
        Object.keys(parameter).forEach(each => {
            if (this.#fields.has(each)) {
                const v = parameter[each];
                if (v || (typeof v === 'boolean')) {
                    this.#fields.get(each).value = v;
                }
            }
        });
    }

    focus() {
        setTimeout(() => {
            const focusable = [... this.#fields.values()].find(each => each instanceof TextField || each instanceof PasswordField || each instanceof Textarea);
            if (focusable) {
                focusable.focus();
            }
        }, 100);
    }

    reset(focus = true) {
        const texts = [...this.#fields.values()].filter(each => each instanceof TextField || each instanceof Textarea);
        texts.forEach(each => each.value = '');
        if (focus) {
            this.focus();
        }
    }

    async submit(listener) {
        const parameter = this.parameter;
        if (parameter) {
            await listener(parameter);
        }
    }

}

class TextField extends Field {

    #input;

    constructor(model, parent) {
        super(model, parent);
        if (model.prefix) {
            this.child('ui-array', span => {
                span.child('span').html(model.prefix);
                this.#input = span.child('input');
            });
        } else {
            if (model.description) {
                const valueHolder = new UI('ui-field-value-with-description', this);
                this.#input = new UI('input', valueHolder);
                new Message(model.description, valueHolder);
            } else {
                this.#input = new UI('input', this);
            }
        }
        this.#input.el.type = 'text';
        if (model.input) {
            this.#input.on('input', () => {
                model.input(this.value);
            });
        }
        if (model.change) {
            this.#input.on('input', () => model.change(this.value));
        }
        this.#input.attr('id', `_${_FIELD_ID}`);
    }

    get value() {
        const result = this.#input.el.value;
        if (!result && this.required()) {
            this.#input.attr('placeholder', I18n.get('message.field_is_required'));
            const click = () => {
                this.#input.removeAttr('placeholder');
                this.el.removeEventListener('keydown', click);
            };
            this.on('keydown', click);
            throw SyntaxError();
        }
        return result;
    }

    set value(value) {
        this.#input.el.value = value;
    }

    focus() {
        this.#input.el.focus();
    }

    get input() {
        return this.#input;
    }

}

class UnitField extends Field {

    #input;

    #dropdown;

    #unit;

    constructor(model, parent) {
        super(model, parent);
        this.addClass('unit_field');

        this.#input = new UI('input').attr('type', 'number');
        if (model.hasOwnProperty('min') || model.hasOwnProperty('max')) {
            if (model.hasOwnProperty('min')) {
                this.#input.attr('min', model.min);
            }
            if (model.hasOwnProperty('max')) {
                this.#input.attr('max', model.max);
            }
            if (model.allowEmpty) {
                this.#input.attr('data-allow-empty', 'true');
            }
            this.#input.on('change', (event) => {
                WebUtils.validateNumber(event);
                if (model.input) {
                    model.input(this.value, event);
                }
            });
        }
        if (model.input) {
            this.#input.on('input', (event) => model.input(this.value, event));
        }
        this.#input.attr('id', `_${_FIELD_ID}`);

        if (model.unit) {
            this.#unit = model.unit;
            new UIArray([
                this.#input,
                new UI('span').html(model.unit),
            ], this);
        } else {
            if (model.type === 'PDF') {
                this.#dropdown = new RadioGroup({
                    value: 'pt',
                    values: [
                        { name: 'pt', value: 'pt' },
                        { name: 'em', value: 'em' },
                        { name: 'rem', value: 'rem' },
                    ],
                    input: () => {
                        if (model.input) {
                            model.input(this.value);
                        }
                    },
                });
            } else {
                this.#dropdown = new RadioGroup({
                    value: 'px',
                    values: [
                        { name: 'px', value: 'px' },
                        { name: 'em', value: 'em' },
                        { name: 'rem', value: 'rem' },
                    ],
                    input: () => {
                        if (model.input) {
                            model.input(this.value);
                        }
                    },
                });
            }
            new UIArray([
                this.#input,
                this.#dropdown,
            ], this);
        }
    }

    get value() {
        const v = this.#input.el.value;
        const unit = this.#unit || this.#dropdown.value;
        if (v && unit) {
            return v + unit;
        } else {
            return '';
        }
    }

    set value(value) {
        if (value) {
            this.#input.el.value = Number.parseFloat(value);
            if (this.#dropdown) {
                let unit;
                if (value.endsWith('rem')) {
                    unit = 'rem';
                } else if (value.endsWith('em')) {
                    unit = 'em';
                } else if (value.endsWith('px')) {
                    unit = 'px';
                } else if (value.endsWith('pt')) {
                    unit = 'pt';
                }
                if (unit) {
                    this.#dropdown.value = unit;
                }
            }
        }
    }

    focus() {
        this.#input.el.focus();
    }

}

class DropdownField extends Field {

    #dropdown;

    constructor(model, parent) {
        super(model, parent);
        this.addClass('dropdown_field');
        if (model.input) {
            model.listener = () => {
                model.input(this.value);
            };
        }
        if (model.loader) {
            this.load(model);
        } else {
            if (model.description) {
                const valueHolder = new UI('ui-field-value-with-description', this);
                this.#dropdown = new Dropdown(model, valueHolder);
                new Message(model.description, valueHolder);
            } else {
                this.#dropdown = new Dropdown(model, this);
            }
        }
    }

    async load(model) {
        model.values = await model.loader();
        this.#dropdown = new Dropdown(model, this);
    }

    get value() {
        return this.#dropdown.value;
    }

    set value(value) {
        if (this.#dropdown) {
            this.#dropdown.value = value;
        } else {
            setTimeout(() => {
                this.value = value;
            }, 100);
        }
    }

}

class ArrowHeadField extends Field {

    #selector;

    constructor(model, parent) {
        super(model, parent);
        this.addClass('arrow_head_field');
        this.#selector = new ArrowHeadSelector({
            listener: value => {
                if (model.input) {
                    model.input(value);
                }
            },
        }, this);
    }

    get value() {
        return this.#selector.value;
    }

    set value(value) {
        this.#selector.value = value;
    }

}

class ArrowHeadSelector extends UI {

    #value;

    constructor({
        value,
        listener,
    }, parent) {
        super('ui-arrow-head-picker', parent);
        if (listener) {
            this.on('click', () => {
                const fp = new FloatingPanel();
                const div = new UI('div', fp).addClass('arrow_head');
                ['none', 'opened_arrow', 'filled_arrow', 'filled_circle', 'filled_square', 'filled_diamond'].forEach(each => {
                    const p = new UI('p', div);
                    p.el.dataset.type = each;
                    p.attr('title', I18n.get(`label.${each}`));
                    p.html('<i></i>');
                    p.on('click', event => {
                        this.value = each;
                        listener(each);
                        fp.close();
                    })
                });
                fp.open(this);
            });
        }
        this.html('<i></i>');
        if (value) {
            this.value = value;
        }
    }

    get value() {
        return this.#value;
    }

    set value(value) {
        this.#value = value;
        this.el.dataset.type = value;
        this.attr('title', I18n.get(`label.${value}`));
    }

}


class ImageField extends Field {

    #imagePanel;

    #img;

    #value;

    #model;

    constructor(model, parent) {
        super(model, parent);
        this.addClass('image_field');
        this.#model = model;
        this.#img = new UI('span', this).hide();
        new UIArray([
            this.#img,
            new Link({
                name: I18n.get('label.select_image'),
                listener: () => this.select(),
            }),
            new Link({
                name: I18n.get('label.remove_image'),
                listener: () => {
                    this.value = null;
                    if (this.#model.input) {
                        this.#model.input(this.value);
                    }
                },
            }),
        ], this);
    }

    select() {
        if (!this.#imagePanel) {
            this.#imagePanel = new ImagePanel((image, src) => {
                let v = image;
                const { mode } = this.#model;
                if (mode === 'src') {
                    v = src;
                } else if (mode === 'id') {
                    v = src.replace('/r/image/get/', '');
                }
                this.value = v;
                if (this.#model.input) {
                    this.#model.input(this.value);
                }
            });
        }
        this.#imagePanel.show();
    }

    get value() {
        return this.#value;
    }

    set value(value) {
        this.#value = value;
        if (value) {
            let i = value;
            if (!i.startsWith('url(')) {
                if (!i.startsWith('/r/image/get/')) {
                    i = `/r/image/get/${i}`;
                }
                i = `url(${i})`;
            }
            this.#img.css({
                backgroundImage: i,
            }).show();
        } else {
            this.#img.hide();
        }
    }

}

class NumberField extends TextField {

    constructor(model, parent) {
        super(model, parent);
        this.input.attr('type', 'number');
        if (model.min) {
            this.input.attr('min', model.min);
        }
        if (model.max) {
            this.input.attr('max', model.max);
        }
        if (model.step) {
            this.input.attr('step', model.step);
        }
        if (model.size) {
            this.input.addClass(model.size);
        }
    }

    get value() {
        return Number(super.value);
    }

    set value(value) {
        super.value = value;
    }

}

class Textarea extends Field {

    #textarea;

    constructor(model, parent) {
        super(model, parent);

        if (model.description) {
            const valueHolder = new UI('ui-field-value-with-description', this);
            this.#textarea = new UI('textarea', valueHolder);
            new Message(model.description, valueHolder);
        } else {
            this.#textarea = this.child('textarea');
        }
        this.#textarea.attr('id', `_${_FIELD_ID}`);
        if (model.className) {
            this.#textarea.addClass(model.className);
        }
        if (model.placeholder) {
            this.#textarea.attr('placeholder', model.placeholder);
        }
        if (model.value) {
            this.value = model.value;
        }
        if (model.change) {
            this.#textarea.on('keyup', () => model.change(this.#textarea.el.value));
        } else if (model.input) {
            this.#textarea.on('keyup', () => model.input(this.#textarea.el.value));
        }
        if (model.hasOwnProperty('spellcheck')) {
            this.#textarea.attr('spellcheck', model.spellcheck);
        }
        if (model.size) {
            this.#textarea.el.dataset.size = model.size;
        }
    }

    get value() {
        const result = this.#textarea.el.value;
        if (!result && this.required()) {
            this.#textarea.attr('placeholder', I18n.get('message.field_is_required'));
            const click = () => {
                this.#textarea.removeAttr('placeholder');
                this.el.removeEventListener('click', click);
            };
            this.on('click', click);
            throw SyntaxError();
        }
        return result;
    }

    set value(value) {
        this.#textarea.el.value = value;
    }

    focus() {
        this.#textarea.el.focus();
    }

}

class DateField extends Field {

    #picker;

    constructor(model, parent) {
        super(model, parent);
        this.#picker = new DatePicker({}, this).attr('id', `_${_FIELD_ID}`);
    }

    get value() {
        return this.#picker.value;
    }

    set value(value) {
        this.#picker.value = value;
    }

}

class TimeField extends Field {

    #picker;

    constructor(model, parent) {
        super(model, parent);
        this.#picker = new TimePicker(this).attr('id', `_${_FIELD_ID}`);
        if (model.value) {
            this.#picker.value = model.value;
        }
    }

    get value() {
        return this.#picker.value;
    }

    set value(value) {
        this.#picker.value = value;
    }

}

class DateTimeField extends Field {

    #picker;

    #hour;

    #minute;

    constructor(model, parent) {
        super(model, parent);
        this.#picker = new DatePicker(model, this).attr('id', `_${_FIELD_ID}`);

        const picker = new UI('ui-time-minute-picker', this);
        const houres = [];
        for (let i = 0; i < 24; i++) {
            houres.push({
                name: i,
                value: i,
            });
        }
        this.#hour = new Dropdown({
            values: houres,
            placeholder: '00',
        }, picker);
        new UI('span', picker).plain(':');
        const minutes = [];
        for (let i = 0; i < 60; i++) {
            minutes.push({
                name: i,
                value: i,
            });
        }
        this.#minute = new Dropdown({
            values: minutes,
            placeholder: '00',
        }, picker);
        new Icon('av_timer', picker);
    }

    get value() {
        const date = this.#picker.value;
        if (date) {
            return {
                date,
                hour: this.#hour.value || 0,
                minute: this.#minute.value || 0,
            };
        }
    }

    set value(value) {
        if (value) {
            this.#picker.value = value.date;
            this.#hour.value = value.hour;
            this.#minute.value = value.minute;
        }
    }

}

class DocumentField extends Field {

    #model;

    #value;

    #link;

    constructor(model, parent) {
        super(model, parent);
        this.addClass('document_field');
        this.#link = new Link({
            name: I18n.get('label.select_book'),
            listener: () => {
                if (this.#value) {
                    const cm = new ContextMenu();
                    cm.add({
                        name: I18n.get('label.select_book'),
                        listener: () => this.open(),
                    });
                    cm.add({
                        name: I18n.get('label.remove'),
                        listener: () => {
                            this.#value = null;
                            this.#link.name = I18n.get('label.select_book');
                        },
                    });
                    cm.open(this.#link);
                } else {
                    this.open();
                }
            },
        }, this);
        this.#model = model;
    }

    open(link) {
        new DocumentSelector(this.#model.option).open(async ({ id, title, }, selector) => {
            this.#value = id;
            this.#link.name = title;
            if (this.#model.input) {
                this.#model.input({ id, title });
            }
            selector.close();
        });
    }

    get value() {
        return this.#value;
    }

    set value(value) {
        if (value) {
            Http.get(`/r/document/any/${value}`).then(({ title }) => {
                this.#link.name = title;
                this.#value = value;
            });
        }
    }

}

class ChapterField extends Field {

    #list;

    #panel;

    constructor(model, parent) {
        super(model, parent);
        this.addClass('chapter_field');
        this.#panel = new Flex({}, this).addClass('items-stretch', 'flex', 'flex-col', 'gap-4', 'w-full');
        if (model.bookId) {
            this.displayChapters(model.bookId, model);
        } else {
            new Link({
                name: I18n.get('label.select_book'),
                listener: () => {
                    new DocumentSelector().open(async ({ id, }, selector) => {
                        await this.displayChapters(id, model);
                        selector.close();
                    });
                },
            }, this.#panel);
        }
    }

    async displayChapters(id, model) {
        const chapters = await Http.get(`/r/book/get_chapters/${id}`);
        if (!this.#list) {
            this.#list = new List({}, this.#panel).css({
                maxHeight: '50dvh',
            });
        } else {
            this.#list.clear();
        }
        this.#list.add(new Checkbox({
            label: I18n.get('label.all'),
            listener: ({ target }) => {
                const checked = target.checked;
                [...this.queryAll('input')].forEach(each => {
                    if (each.value && !each.disabled) {
                        each.checked = checked;
                    }
                });
            },
        }));
        const f = (each, inPart) => {
            const item = new UIArray();
            item.add(new Checkbox({
                label: new Html(each.title),
                value: each.id,
                disabled: model.disableReferenced && each.referenced,
            }));
            this.#list.add(item);
            if (inPart) {
                item.css({
                    paddingLeft: '1.5rem',
                })
            }
            if (each.chapters) {
                each.chapters.forEach(child => f(child, true));
            }
        };
        chapters.forEach(each => f(each, false));
    }

    get value() {
        const result = [];
        [...this.queryAll('input:checked')].forEach(each => {
            if (each.value) {
                result.push(each.value);
            }
        });
        return result;
    }

    set value(value) {
        // ignore
    }

}
class TextInput extends UI {

    constructor({ value, width }, parent) {
        super('input', parent);
        this.el.type = 'text';
        if (value) {
            this.value = value;
        }
        if (width) {
            this.el.style.width = width;
        }
        setTimeout(() => this.el.focus(), 100);
    }

    get value() {
        return this.el.value;
    }

    set value(value) {
        this.el.value = value;
    }

    focus() {
        this.el.focus();
    }

    enter(listener) {
        this.on('keydown', event => {
            const { key } = event;
            if (key === 'Enter') {
                event.preventDefault();
                listener();
            }
        });
    }

}
const GridSortMode = {
    ASC: Symbol(),
    DESC: Symbol()
};

const GridFooter = {
    SUM: Symbol(),
};

class Grid extends UI {

    #model;

    #table;

    #tbody;

    #tfoot;

    #sortedHeader;

    #data;

    #pageNavigator;

    #sortOption;

    #headers = [];

    constructor(model, parent) {
        super('ui-grid', parent);
        this.addClass('mouseover-scrollbar');
        this.#model = model;
        this.#table = new UI('table', this);
        new UI('tr', new UI('thead', this.#table));
        if (model.columns) {
            this.columns = model.columns;
        }
        this.#tbody = new UI('tbody', this.#table);
        this.data = model.data || [];
        if (model.maxHeight) {
            this.css({
                maxHeight: model.maxHeight,
            })
        }
    }

    set columns(temp) {
        const columns = [];
        for (let i = 0; i < temp.length; i++) {
            let column = temp[i];
            if (typeof column === 'string') {
                column = { id: column };
            } else if (column instanceof Function) {
                column = column();
                if (!column) {
                    continue;
                }
            }
            if (column.w) {
                column.width = column.w;
            }
            if (column.unit === 'dateTime' && !column.width) {
                column.width = 10;
            }
            column.width = column.width || 6;
            columns[columns.length] = column;
        }
        if (this.#model.selectable) {
            columns.unshift({
                width: 1.5,
                className: 'unit_fixed',
                renderHeader: () => {
                    const all = new UI('input').attr('type', 'checkbox');
                    all.el.addEventListener('input', () => {
                        const d = this.data;
                        if (d) {
                            if (all.el.checked) {
                                d.forEach(each => {
                                    if (each._selectable) {
                                        each._selected = true
                                    }
                                });
                            } else {
                                this.#data.forEach(each => delete each._selected);
                            }
                            this.data = d;
                        }
                    });
                    return all;
                },
                sortable: false,
                render: value => {
                    if (!value._selectable) {
                        return;
                    }
                    const checkbox = new UI('input');
                    checkbox.attr('type', 'checkbox');
                    checkbox.css({ marginLeft: '.5rem' });
                    if (value._selected) {
                        checkbox.el.checked = true;
                    }
                    checkbox.el.addEventListener('input', () => {
                        if (checkbox.el.checked) {
                            value._selected = true;
                        } else {
                            delete value._selected;
                        }
                    });
                    return checkbox;
                },
            });
        }
        this.#model.columns = columns;
        this.#headers.length = 0;
        columns.forEach(each => this.#headers.push(new GridHeader(each, this)));
    }

    get data() {
        return this.#data;
    }

    get selected() {
        if (this.#data) {
            return this.#data.filter(each => each._selected);
        } else {
            return [];
        }
    }

    set data(data) {
        this.#tbody.clear();
        this.#data = data;
        data = data.totalCount ? data.values : data;
        this.#headers.forEach(each => {
            if (each.filter) {
                const key = each.filter;
                const model = each.model;
                data = data.filter((each) => each[model.id] === key);
            }
        })

        if (data && data.length) {
            data.forEach(item => {
                if (item.children) {
                    const td = new UI('td', new UI('tr', this.#tbody));
                    td.addClass('group_row');
                    td.attr('colspan', this.#model.columns.length);
                    new UIArray([
                        new Icon('navigate_next'),
                        new UI('span').html(item.name),
                    ], td);
                    item.children.forEach(each => this.renderRow(each).addClass('grouped'));
                } else {
                    this.renderRow(item);
                }
            });
            if (this.#model.columns.filter(each => each.footer).length) {
                if (!this.#tfoot) {
                    this.#tfoot = new UI('tfoot', this.#table);
                } else {
                    this.#tfoot.clear();
                }
                const tr = new UI('tr', this.#tfoot);
                this.#model.columns.forEach(({ id, footer, unit }) => {
                    const td = new UI('th', tr);
                    if (footer) {
                        if (footer === GridFooter.SUM) {
                            let sum = 0;
                            data.forEach(item => {
                                const v = item[id];
                                if (v && typeof v === 'number') {
                                    sum += v;
                                }
                                if (item.children) {
                                    item.children.forEach(child => {
                                        const v = child[id];
                                        if (v && typeof v === 'number') {
                                            sum += v;
                                        }
                                    });
                                }
                            });
                            if (unit === 'file') {
                                new FileSizeUnit(sum, td);
                            } else {
                                new NumberUnit(sum, td);
                            }
                        }
                    }
                });
            }
        } else if (this.#model.columns) {
            const td = new UI('td', new UI('tr', this.#tbody));
            td.attr('colspan', this.#model.columns.length);
            td.css({
                textAlign: 'center',
            });
            td.html(I18n.get('label.empty_row'));
            if (!this.#tfoot) {
                this.#tfoot = new UI('tfoot', this.#table);
            } else {
                this.#tfoot.clear();
            }
        }
        if (this.#data.totalCount || this.#data.page) {
            if (!this.#pageNavigator) {
                this.#pageNavigator = new GridPageNavigator(this);
            }
            this.#pageNavigator.page = this.#data;
        }
    }

    renderRow(item) {
        const tr = new UI('tr', this.#tbody);
        this.#model.columns.forEach(each => {
            const td = new UI('td', tr);
            if (each.className) {
                td.addClass(each.className);
            }
            if (each.unit === 'code') {
                td.addClass('code');
            }
            if (each.render) {
                const view = each.render(item, this, td);
                if (view) {
                    if (Array.isArray(view)) {
                        new UIArray(view, td);
                    } else if (typeof view === 'string') {
                        td.append(document.createTextNode(view));
                    } else {
                        td.append(view);
                    }
                }
            } else {
                const value = item[each.id];
                if (value) {
                    if (typeof value === 'number') {
                        if (each.unit === 'dateTime') {
                            new DateTime(value, td);
                        } else if (each.unit === 'file') {
                            new FileSizeUnit(value, td);
                        } else {
                            new NumberUnit(value, td);
                        }
                    } else {
                        td.plain(value);
                    }
                }
            }
        });
        return tr;
    }

    sort(header) {
        if (this.#sortedHeader) {
            this.#sortedHeader.removeClass('asc', 'desc');
        }
        (this.#sortedHeader = header).toggleSortMode();
        const { id, sortMode } = this.#sortedHeader;
        this.#sortOption = {
            id,
            sortMode,
        };
        if (this.#model.page) {
            this.page(1);
        } else {
            this.#data.sort((a, b) => {
                a = a[id] || '';
                b = b[id] || '';
                if (a < b)
                    return sortMode === GridSortMode.ASC ? -1 : 1;
                if (a > b)
                    return sortMode === GridSortMode.ASC ? 1 : -1;
                return 0;
            });
            this.data = this.#data;
        }
    }

    refresh() {
        this.data = this.data;
    }

    reload() {
        this.page(this.#pageNavigator.page);
    }

    getPageOption(page) {
        let result = {
            page: page || this.#pageNavigator.page,
        };
        if (this.#sortOption) {
            result = Object.assign(result, this.#sortOption);
        }
        if (result.sortMode === GridSortMode.ASC) {
            result.sortMode = 'asc';
        } else if (result.sortMode === GridSortMode.DESC) {
            result.sortMode = 'desc';
        }
        return result;
    }

    page(page) {
        this.#model.page(this.getPageOption(page));
    }

    addLine(render) {
        const tr = new UI('tr');
        const e = this.#tbody.el;
        e.insertBefore(tr.el, e.firstChild);
        this.#model.columns.forEach(column => {
            const td = new UI('td', tr);
            const cell = render(column);
            if (cell) {
                td.append(cell);
            }
        });
        tr.on('keyup', event => {
            if (event.key === 'Escape') {
                tr.remove();
            }
        });
    }

    editable() {
        this.addClass('editable');
        return this;
    }

    addRow(row) {
        if (!this.data) {
            this.data = [];
        }
        this.data.push(row);
        this.refresh();
    }

    removeRow(row) {
        if (this.data.values && Array.isArray(this.data.values)) {
            this.data.values = this.data.values.filter(each => each !== row);
            this.refresh();
        } else {
            this.data = this.data.filter(each => each !== row);
        }
    }

    move(event, handler) {
        const t = document.elementFromPoint(event.x, event.y);
        if (!t || t.innerText !== 'drag_indicator') {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        const tr = t.closest('tr');
        let overed;
        const dragover = (event) => {
            event.stopPropagation();
            let target = document.elementFromPoint(event.x, event.y);
            if (target.tagName !== 'TR') {
                target = target.closest('TR');
            }
            if (overed) {
                DomUtil.removeClass(overed.el, 'drag_before', 'drag_after');
                overed = null;
            }
            if (target && !t.closest('tr').contains(target)) {
                event.preventDefault();
                overed = {
                    el: target,
                };
                let { y, height } = target.getBoundingClientRect();
                y = event.y - y;
                if (y < height / 2) {
                    overed.position = 'before';
                    DomUtil.addClass(overed.el, 'drag_before');
                } else {
                    overed.position = 'after';
                    DomUtil.addClass(overed.el, 'drag_after');
                }
            }
        };
        const drop = async (event) => {
            event.stopPropagation();
            if (overed) {
                const { position, el } = overed;
                el[position](tr);
                Animcation.fadeIn(tr);
                const before = this.data;
                const after = [];
                [...panel.queryAll('ui-array')].forEach(each => {
                    const id = each.dataset.id;
                    if (id) {
                        let item;
                        if (before.values && Array.isArray(before.values)) {
                            item = before.values.find(e => e.id === id);
                        } else {
                            item = before.find(e => e.id === id);
                        }
                        if (item) {
                            after.push(item);
                        }
                    }
                });
                if (handler) {
                    await handler(after);
                }
                if (before.values && Array.isArray(before.values)) {
                    before.values = after;
                    this.data = before;
                } else {
                    this.data = after;
                }
            }
        };
        const panel = new UI(t.closest('tbody'));
        const dragend = event => {
            event.stopPropagation();
            if (overed) {
                DomUtil.removeClass(overed.el, 'drag_before', 'drag_after');
            }
            panel.off('dragover', dragover);
            panel.off('drop', drop);
            this.off('dragend', dragend);
        };
        panel.on('dragover', dragover);
        panel.on('drop', drop);
        tr.querySelector('ui-array').addEventListener('dragend', dragend);
    }

    async load(loader) {
        this.#tbody.css({ visibility: 'hidden' });
        const div = new UI('div', this).addClass('pt-4', 'pb-4');
        await div.skeleton(async () => {
            await loader();
            this.#tbody.css({ visibility: 'visible' });
            div.remove();
        }, 10);
    }

};

class GridHeader extends UI {

    #grid;

    #model;

    #id;

    #filter;

    #sortMode = GridSortMode.ASC;

    constructor(model, grid) {
        super('th', grid.query('thead > tr'));
        this.#grid = grid;
        this.#model = model;
        this.#id = model.id;
        if (model.width) {
            this.css({
                width: `${model.width}rem`,
            });
        }
        if (model.renderHeader) {
            const ui = model.renderHeader();
            if (ui) {
                new UI('div', this).css({ textAlign: 'center' }).append(ui);
            }
        } else {
            if (model.name || model.id) {
                const div = new UI('div').plain(model.name || I18n.get(`label.${WebUtils.underscore(model.id)}`));
                if (model.filter) {
                    const filterIcon = new Icon('filter_list');
                    filterIcon.on('click', event => {
                        event.preventDefault();
                        event.stopPropagation();
                        const cm = new ContextMenu();
                        model.filter.forEach(each => {
                            cm.add({
                                id: each,
                                name: I18n.get(`label.${WebUtils.underscore(each.toLowerCase())}`),
                                checked: this.#filter === each,
                                listener: (item) => {
                                    if (item.checked()) {
                                        filterIcon.icon = 'filter_list';
                                        filterIcon.removeClass('blue', 'fill');
                                        this.#filter = null;
                                    } else {
                                        filterIcon.icon = 'filter_alt';
                                        filterIcon.addClass('blue', 'fill');
                                        this.#filter = each;
                                    }
                                    grid.refresh();
                                },
                            })
                        });
                        cm.open(event.target);
                    });
                    new UIArray([filterIcon, div], this);
                } else {
                    this.append(div);
                }
            }
            if (model.sortable === undefined || model.sortable) {
                this.addClass('sortable');
                this.el.addEventListener('click', event => {
                    let { x } = this.el.getBoundingClientRect();
                    if (event.x - x >= 8) {
                        grid.sort(this);
                    }
                });
            }
        }
        this.resizeColumnWidth();
    }

    get id() {
        return this.#id;
    }

    get sortMode() {
        return this.#sortMode;
    }

    get model() {
        return this.#model;
    }

    get filter() {
        return this.#filter;
    }

    toggleSortMode() {
        if (this.#sortMode === GridSortMode.ASC) {
            this.addClass('desc');
            this.removeClass('asc');
            this.#sortMode = GridSortMode.DESC;
        } else {
            this.addClass('asc');
            this.removeClass('desc');
            this.#sortMode = GridSortMode.ASC;
        }
    }

    resizeColumnWidth() {
        const mousemove = event => {
            let { x } = this.el.getBoundingClientRect();
            if (this.#grid.status === 'columnResize' || event.x - x < 8) {
                this.el.style.cursor = 'col-resize';
            } else {
                this.el.style.cursor = 'default';
            }
        }
        this.on('mousemove', mousemove);
        this.on('mouseleave', event => {
            this.el.style.cursor = 'default';
        });
        this.on('mousedown', event => {
            let { x } = this.el.getBoundingClientRect();
            if (event.x - x < 8) {
                this.#grid.status = 'columnResize';
                if (!this.#grid.hasClass('width_configured')) {
                    this.#grid.addClass('width_configured');
                    this.#grid.queryAll('thead th').forEach(each => {
                        DomUtil.css(each, {
                            width: `${each.getBoundingClientRect().width}px`,
                        });
                    });
                }
                this.el.removeEventListener('mousemove', mousemove);
                const el = this.el.previousElementSibling;
                if (!el) {
                    return;
                }
                let { width } = el.getBoundingClientRect();
                const move = event => {
                    const _x = event.x;
                    width += (_x - x);
                    el.style.width = `${width}px`;
                    x = _x;
                };
                const up = event => {
                    delete this.#grid.status;
                    this.el.addEventListener('mousemove', mousemove);
                    document.body.removeEventListener('mousemove', move);
                    document.body.removeEventListener('mouseup', up);
                };
                document.body.addEventListener('mousemove', move);
                document.body.addEventListener('mouseup', up);
            }
        });
    }

};

class GridPageNavigator extends UI {

    #page;

    constructor(grid) {
        super('ui-grid-page-navigator', grid);
    }

    get page() {
        return this.#page;
    }

    set page({ page, totalCount, countOfOnePage }) {
        this.clear();
        if (totalCount === 0) {
            return;
        }
        this.#page = page;
        const start = countOfOnePage * (page - 1) + 1;
        const end = Math.min(totalCount, countOfOnePage * page);
        if (page > 1) {
            new Icon({
                icon: 'arrow_back_ios_new',
                listener: () => this.parent.page(page - 1),
            }, this);
        }
        new UI('span', this).html(I18n.get('label.count_of_page', WebUtils.formatNumber(totalCount), `${WebUtils.formatNumber(start)}-${WebUtils.formatNumber(end)}`));
        if (totalCount > end) {
            new Icon({
                icon: 'arrow_forward_ios',
                listener: () => this.parent.page(page + 1),
            }, this);
        }
    }

}

class GridCellEditor extends UI {

    constructor(item, id, height) {
        super('textarea');
        this.el.value = item[id] || '';
        if (item._option && item._option.required) {
            const { required } = item._option;
            if (required.includes(id)) {
                this.addClass('error');
                this.attr('title', I18n.get('message.field_is_required'));
                const click = () => {
                    const i = required.indexOf(id)
                    if (i !== -1) {
                        required.splice(i, 1);
                    }
                    this.el.removeAttribute('title', null);
                    this.removeClass('error');
                    this.off('click', click);
                };
                this.on('click', click);
            }
        }
        if (height) {
            this.css({
                height,
            });
            this.on('input', each => {
                item[id] = this.el.value;
                this.css({
                    height: 0,
                });
                this.css({
                    height: `${this.el.scrollHeight}px`,
                });
            });
        } else {
            this.on('input', each => {
                item[id] = this.el.value;
                this.css({
                    height: 0,
                });
                this.css({
                    height: `${this.el.scrollHeight}px`,
                });
            });
            setTimeout(() => {
                this.css({
                    height: `${this.el.scrollHeight}px`,
                });
            }, 100);
        }
    }

}

class GridCellDropdown extends Dropdown {

    constructor(item, id, { values, placeholder }) {
        super({
            values,
            value: item[id],
            placeholder,
            listener: v => item[id] = v,
        });
        if (item._option && item._option.required) {
            const { required } = item._option;
            if (required.includes(id)) {
                this.addClass('error');
                this.attr('title', I18n.get('message.field_is_required'));
                const click = () => {
                    const i = required.indexOf(id)
                    if (i !== -1) {
                        required.splice(i, 1);
                    }
                    this.el.removeAttribute('title', null);
                    this.removeClass('error');
                    this.off('click', click);
                };
                this.on('click', click);
            }
        }
        if (item._option && item._option.duplication) {
            const { duplication } = item._option;
            if (duplication.includes(id)) {
                this.addClass('error');
                this.attr('title', I18n.get('label.data_duplicated'));
                const click = () => {
                    const i = duplication.indexOf(id)
                    if (i !== -1) {
                        duplication.splice(i, 1);
                    }
                    this.el.removeAttribute('title', null);
                    this.removeClass('error');
                    this.off('click', click);
                };
                this.on('click', click);
            }
        }
    }

}
const WebHistory = {

    isPop: false,

    handlers: new Map(),

    scrollTops: new Map(),

    init: () => {
        window.onpopstate = ({ state }) => {
            if (state && state.type) {
                const handler = WebHistory.handlers.get(state.type);
                if (handler) {
                    WebHistory.isPop = true;
                    handler(state);
                    const scrollTop = WebHistory.scrollTops.get(window.location.pathname);
                    if (scrollTop) {
                        const main = document.querySelector('ui-main');
                        if (main) {
                            setTimeout(() => {
                                main.scrollTop = scrollTop;                                
                            }, 100);
                        }
                    }
                }
            }
        }
    },

    addHandler: (name, handler) => {
        WebHistory.handlers.set(name, handler);
    },

    push: (state, path) => {
        if (WebHistory.isPop) {
            WebHistory.isPop = false;
            return;
        }
        const { search } = window.location;
        if (search) {
            const i = path.indexOf('#');
            if (i !== -1) {
                path = path.substring(0, i) + search + path.substring(i);
            } else {
                path += search;
            }
        }
        try {
            const main = document.querySelector('ui-main');
            if (main) {
                WebHistory.scrollTops.set(window.location.pathname, main.scrollTop);
            }
            history.pushState(state, '', path);
        } catch (ignore) {
            window.location.hash = state.element || state.id;
        }
    },

};
const Http = {
    caches: new Map(),
    headers: new Map(),

    setHeader(name, value) {
        Http.headers.set(name, value);
    },

    async http({ url, method, parameter }) {
        const headers = {
            '3Rabbitz-Fetch': 'true',
            ...Object.fromEntries(Http.headers)
        };

        let body;
        if (method === 'POST') {
            headers['Content-Type'] = 'application/json';
            body = parameter ? JSON.stringify(parameter) : undefined;
        }

        const response = await fetch(url, { method, headers, body });
        if (response.headers.get('Signout')) {
            if (window.executer) {
                // TODO skeleteon 처리
            }
            new Signout().handle(() => {
                if (method === 'GET' && window.executer) {
                    window.executer.refresh(url);
                }
            });
            throw new Error();
        }

        const contentType = response.headers.get('Content-Type');
        const data = contentType && contentType.startsWith('text') ? await response.text() : await response.json();

        const { error, errorTrace } = data;
        if (errorTrace) {
            Messages.showAutoClose(I18n.get('label.500'));
            console.error(errorTrace);
            throw new Error();
        } else if (error && data.type !== 'VERSION_OVERRIDDED') {
            if (error.message) {
                Messages.show({
                    content: error.message,
                    closable: true,
                });
            } else {
                Messages.showAutoClose(error);
            }
            throw new Error();
        }
        return data;
    },

    get(url, cache = false) {
        if (cache && Http.caches.has(url)) {
            return Promise.resolve(Http.caches.get(url));
        }

        const result = Http.http({ url, method: 'GET' });
        if (cache) {
            Http.caches.set(url, result);
        }
        return result;
    },

    set(url, value) {
        Http.caches.set(url, value);
    },

    post(url, parameter = {}) {
        return Http.http({ url, method: 'POST', parameter });
    },

    async download(url, parameter = {}) {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(parameter),
            headers: {
                '3Rabbitz-Fetch': 'true',
                'Content-Type': 'application/json',
            }
        });

        const disposition = response.headers.get('Content-Disposition');
        let filename = disposition.split(/;(.+)/)[1].split(/=(.+)/)[1];
        filename = decodeURIComponent(escape(filename)).replaceAll('"', '');

        const blob = await response.blob();
        const a = document.createElement('a');
        const objectUrl = window.URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = filename;
        a.click();
    },

    upload(model, message = false) {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = () => {
            const file = input.files[0];
            const { uploadFileMaxSize } = Applications.getOption();
            if (uploadFileMaxSize > 0 && file.size > (uploadFileMaxSize * 1024 * 1024)) {
                Messages.showAutoClose(I18n.get('label.upload_file_max_size_exceeded', uploadFileMaxSize));
                return;
            }
            if (model.extensions && model.extensions.length && !model.extensions.includes(WebUtils.getExtension(file.name))) {
                Messages.showAutoClose(`${I18n.get('label.unsupported_file_for_import')} [${model.extensions.toString()}]`);
            } else {
                Http.uploadFile(file, model, message);
            }
        };
        input.click();
    },

    uploadFile(file, { url = '/r/file/upload', type, directoryId, path, listener, progressListener }, message) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            const xhr = new XMLHttpRequest();
            const uploadMessage = message ? new FileUploadMessage(file.name) : null;

            xhr.upload.addEventListener('progress', e => {
                if (e.lengthComputable) {
                    const percentage = Math.round((e.loaded * 100) / e.total);
                    if (progressListener) {
                        progressListener(percentage);
                    } else if (uploadMessage) {
                        uploadMessage.rate = percentage;
                    }
                }
            });

            xhr.open('POST', url);
            Http.headers.forEach((value, key) => xhr.setRequestHeader(key, value));
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            if (type) xhr.setRequestHeader('r-type', type);
            xhr.setRequestHeader('r-file-name', encodeURIComponent(file.name));
            xhr.setRequestHeader('r-file-type', file.type);
            if (directoryId) xhr.setRequestHeader('r-directory-id', directoryId);
            if (path) xhr.setRequestHeader('r-path', encodeURIComponent(path));

            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE && listener) {
                    const r = xhr.responseText ? JSON.parse(xhr.responseText) : null;
                    if (r) {
                        const { error, errorTrace } = r;
                        if (error) {
                            Messages.showAutoClose(I18n.get('label.500'));
                            console.error(error);
                            if (errorTrace) {
                                console.error(errorTrace);
                            }
                            throw new Error();
                        }
                    }
                    listener(r);
                }
            };
            xhr.send(reader.result);
        };
    },

    async monitor({ url, parameter, progress, removeProgressBar = true, listener, monitor, interval = 1000, }) {
        if (progress) progress = new BarProgress(progress);

        const { uuid } = await Http.post(url, parameter);
        const f = async () => {
            const response = await Http.get(`/r/work/monitor/${uuid}`);
            if (progress) {
                progress.rate = response.rate || 100;
                if (response.completed) {
                    if (removeProgressBar) progress.remove();
                    if (response.result?.errors || response.errors) progress.errorHappend();
                }
                if (response.status === 'WAITING') {
                    progress.message = I18n.get('label.waiting', response.order);
                } else {
                    progress.message = '';
                }
            }
            if (monitor) {
                monitor(response);
            }
            if (response.appError) {
                console.error(response.appError);
            }
            if (response.completed && listener) {
                listener(response);
            }
            if (!response.completed) {
                setTimeout(f, interval);
            }
        }
        setTimeout(f, interval);
    },

    runAndMonitor({ uuid, url, parameter, progress, listener }) {
        if (progress) {
            progress = new BarProgress(progress);
        }
        Http.post(url, parameter);
        const f = async () => {
            const response = await Http.get(`/r/work/monitor/${uuid}`);
            if (progress) {
                progress.rate = response.rate;
                if (response.completed) {
                    progress.remove();
                }
            }
            listener(response);
            if (!response.completed) {
                setTimeout(f, 1000);
            }
        }
        setTimeout(f, 1000);
    }
};

class FileUploadMessage extends UI {
    #bar;

    constructor(name) {
        super('ui-flex-panel');
        this.addClass('gap-2');
        this.#bar = new BarProgress(this);
        new Plain(name, this);
        Messages.showAutoClose({ content: this, closable: true });
    }

    set rate(rate) {
        this.#bar.rate = rate;
    }
}
const I18n = {
    messages: {}
};

I18n.isKorean = () => {
    return I18n.get('locale') === 'ko';
};

I18n.get = (id, ...params) => {
    let result = I18n.messages[id];
    if (!result) {
        return id;
    }
    if (params && params.length) {
        for (let i = 0; i < params.length; i++) {
            const pattern = new RegExp('\\{' + (i) + '\\}', 'g');
            result = result.replace(pattern, params[i]);
        }
    }
    return result;
};

I18n.set = (id, label) => {
    I18n[id] = label;
};

I18n.alert = id => {
    Messages.showAutoClose(I18n.get(id));
};

I18n.confirm = (id, handler) => {
    if (handler) {
        if (confirm(I18n.get(id))) {
            handler();
            return true;
        } else {
            return false;
        }
    } else {
        return confirm(I18n.get(id));
    }
};

I18n.confirmRemove = handler => {
    return I18n.confirm('label.confirm_remove', handler);
};

I18n.load = async callback => {
    I18n.messages = await Http.get('/r/i18n', true);
    await ColorUtils.load();
    callback && callback();
};
class Icon extends UI {

    constructor(icon, parent) {
        super('ui-icon', parent);
        if (typeof icon === 'string') {
            this.html(icon);
        } else {
            this.html(icon.icon);
            if (icon.listener) {
                this.addClass('cursor-pointer');
                this.el.addEventListener(icon.eventName || 'click', event => icon.listener(event, this));
            }
            if (icon.title) {
                this.attr('title', icon.title);
            }
        }
        if (icon.color) {
            this.el.dataset.color = icon.color;
        }
    }

    get icon() {
        return this.el.innerText;
    }

    set icon(icon) {
        this.html(icon);
    }

    static getDocumentIcon(type, title) {
        let result;
        if (type === 'ARTICLE' || type === 'article_type') {
            result = new UI('ui-icon-article').attr('title', I18n.get('label.article'));
        } else if (type === 'BLOG' || type === 'blog_type') {
            result = new UI('ui-icon-blog').attr('title', I18n.get('label.blog'));;
        } else if (type === 'BOOK' || type === 'book_type') {
            result = new UI('ui-icon-book').attr('title', I18n.get('label.book'));;
        } else if (type === 'STATIC' || type === 'static_type') {
            result = new UI('ui-icon-static').attr('title', I18n.get('label.static'));;
        } else if (type === 'VIDEO' || type === 'video_type') {
            result = new UI('ui-icon-video').attr('title', I18n.get('label.video'));;
        } else if (type === 'VISUAL' || type === 'visual_type') {
            result = new UI('ui-icon-visual').attr('title', I18n.get('label.visual'));;
        } else if (type === 'MANDALART' || type === 'mandalart_type') {
            result = new UI('ui-icon-mandalart').attr('title', I18n.get('label.mandalart'));;
        } else if (type === 'PROJECT' || type === 'project_type') {
            result = new UI('ui-icon-project').attr('title', I18n.get('label.project'));;
        } else if (type === 'WATCH') {
            result = new UI('ui-icon-watch').attr('title', I18n.get('label.watched'));;
        } else {
            result = new UI('span');
        }
        if (result) {
            if (title instanceof UI) {
                result.append(title);
            } else {
                result.html(title);
            }
        }
        return result;
    }

    static contextMenu(listener) {
        return new Icon({
            icon: 'more_horiz',
            listener: (event, icon) => {
                const cm = new ContextMenu();
                listener(cm);
                cm.open(icon);
            },
        }).addClass('i_context_menu', 'align-middle');
    }

    static drag(disable = false) {
        return new Icon({
            icon: disable ? 'arrow_right' : 'drag_indicator',
        }).addClass(disable ? null : 'i_drag');
    }

    static owner() {
        return new Icon({
            icon: 'shield',
            title: I18n.get('label.owner'),
        }).addClass('i_owner');
    }

    static check(fail = false) {
        if (fail) {
            return new Icon({
                icon: 'close',
            }).addClass('i_check', 'i_fail');
        } else {
            return new Icon({
                icon: 'check',
            }).addClass('i_check');
        }
    }

    static experiment() {
        return new Icon('experiment').addClass('purple').attr('title', I18n.get('label.experimental_feature'));
    }

}

class IconText extends UI {

    constructor(icon, text, parent) {
        super('ui-icon-text', parent);
        new Icon(icon, this);
        new Plain(text, this);
    }

}

class ImageIcon extends UI {

    constructor(icon, parent) {
        super('ui-image-icon', parent);
        if (typeof icon === 'string') {
            this.el.dataset.icon = icon;
        } else {
            this.el.dataset.icon = icon.icon;
            if (icon.listener) {
                this.el.style.cursor = 'pointer';
                this.el.addEventListener('click', icon.listener);
            }
        }
    }

}

class IconPicker extends UI {

    #icon;

    #remover;

    constructor({
        input,
    }, parent) {
        super('ui-icon-picker', parent);
        this.#icon = new Icon({
            icon: '',
        }, this);
        this.#icon.on('click', (event, icon) => {
            const m = ModalManager.open('icon_modal', () => {
                const modal = new Modal({
                    title: I18n.get('label.icon'),
                });
                modal.el.style.maxWidth = '40rem';
                modal.addComponent(new IconSelector(v => {
                    modal.close();
                    modal.runInput(v);
                }));
                return modal;
            });
            m.runInput = (v) => {
                this.icon = v;
                if (input) {
                    input(v);
                }
            };
        });
    }

    get icon() {
        return this.#icon.icon || null;
    }

    set icon(icon) {
        this.#icon.icon = icon;
        if (icon) {
            if (!this.#remover) {
                this.#remover = new Icon({
                    icon: 'close',
                    title: I18n.get('label.remove'),
                    listener: event => {
                        event.stopPropagation();
                        this.icon = null;
                    },
                }, this).css({
                    position: 'absolute',
                    left: '2.25rem',
                    top: 0,
                }).addClass('circle-small', 'hover:gray');
            } else {
                this.#remover.show();
            }
        } else if (this.#remover) {
            this.#remover.hide();
        }
    }

}

class IconPanel extends UI {

    constructor({ listener }) {
        super('ui-flex-panel');
        new PageHeader({
            icon: 'dialpad',
            title: I18n.get('label.icon'),
            subtitle: new Link({
                name: 'Material Symbols',
                href: 'https://fonts.google.com/icons?selected=Material+Icons&icon.set=Material+Symbols',
                openInNew: true,
            }),
        }, this);
        new IconSelector(listener, this);
    }

}

class IconSelector extends UI {

    constructor(listener, parent) {
        super('ui-flex-panel', parent);
        this.skeleton(async () => {
            const assistants = await Http.get('/r/ai/getAssistants/ICON_SUGGESTER');
            if (Applications.getOption().aiConfigured) {
                new RadioGroup({
                    value: 'filter',
                    values: [
                        {
                            name: I18n.get('label.filter'),
                            value: 'filter',
                            icon: 'filter_alt',
                        },
                        {
                            name: I18n.get('label.ai_suggestions'),
                            value: 'suggest',
                            icon: 'smart_toy',
                        },
                    ],
                    input: v => {
                        if (v === 'filter') {
                            iconPalette.show();
                            if (suggestionPanel) {
                                suggestionPanel.hide();
                            }
                        } else {
                            iconPalette.hide();
                            if (!suggestionPanel) {
                                suggestionPanel = new IconSuggester(listener, assistants, iconPalette, this);
                            }
                            suggestionPanel.show('flex');
                        }
                    },
                }, this);
            }
            let suggestionPanel;
            const iconPalette = new IconPalette(listener, this);
        });
    }

}


class IconPalette extends UI {

    #listener;

    #groups = [];

    #icons = new Set();

    constructor(listener, parent) {
        super('ui-icon-palette', parent);
        this.#listener = listener;
        this.skeleton(async () => await this.load());
    }

    filter({ query }) {
        this.#groups.forEach(group => {
            let matched;
            group.icons.forEach(icon => {
                if (icon.icon.includes(query)) {
                    icon.ui.show();
                    matched = true;
                } else {
                    icon.ui.hide();
                }
            });
            if (matched) {
                group.show();
            } else {
                group.hide();
            }
        });
    }

    has(icon) {
        return this.#icons.has(icon);
    }

    async load() {
        const iconGroups = await Http.get('/resource/font/icon/icons.json', true);
        new SearchBox({
            keyup: true,
            listener: (query) => this.filter(query),
        }, this);
        Object.keys(iconGroups).forEach(group => {
            const panel = new Panel(group, this);
            panel.icons = [];
            this.#groups.push(panel);
            const div = new UI('div', panel);
            iconGroups[group].forEach(icon => {
                this.#icons.add(icon);
                panel.icons.push({
                    icon,
                    ui: new Icon({
                        icon,
                        title: icon,
                        listener: () => this.#listener(icon),
                    }, div)
                });
            });
        });
    }

}

class IconSuggester extends UI {

    #aiPanel;

    constructor(listener, assistants = [], iconPalette, parent) {
        super('ui-icon-suggester', parent);
        this.#aiPanel = new AIPanel({
            assistants,
            listener: async (assistantId, prompt, panel) => {
                const icons = (await Http.post(`/r/icon/suggest/${assistantId}`, { prompt })).filter(icon => iconPalette.has(icon));
                if (icons.length) {
                    icons.forEach(icon => {
                        new Icon({
                            icon,
                            title: icon,
                            listener: () => listener(icon),
                        }, panel);
                    });
                } else {
                    new Message(I18n.get('label.string_not_found'), panel);
                }
            },
        }, this);
    }

    show(display) {
        super.show(display);
        this.#aiPanel.focus();
    }

}

class IconField extends Field {

    #iconPicker;

    constructor(model, parent) {
        super(model, parent);
        this.#iconPicker = new IconPicker(model, this);
    }

    get value() {
        return this.#iconPicker.icon;
    }

    set value(v) {
        this.#iconPicker.icon = v;
    }

}
class Bool extends Icon {
    #on;
    #listener;

    constructor(model = {}, parent) {
        super({
            icon: model.value ? 'radio_button_checked' : 'radio_button_unchecked',
            listener: () => {
                this.value = !this.#on;
                if (model.listener) {
                    model.listener(this.#on);
                }
            },
        }, parent);
        this.addClass('size-3');
        this.#listener = model.listener;
        this.value = model.value || false;
    }

    get value() {
        return this.#on;
    }

    set value(value) {
        this.#on = value;
        this.icon = value ? 'check_box' : 'check_box_outline_blank';
        if (this.#on) {
            this.addClass('green');
        } else {
            this.removeClass('green');
        }
    }

    fire(value) {
        this.value = value;
        if (this.#listener) {
            this.#listener(value);
        }
    }

}

class BoolField extends Field {
    #bool;

    constructor(model, parent) {
        super(model, parent);
        if (model.input && !model.listener) {
            model.listener = () => model.input();
        }
        const label = this.query('label');
        if (label) {
            label.addEventListener('click', () => this.#bool.fire(!this.#bool.value));
        }
        this.#bool = new Bool(model, this).attr('id', `_${_FIELD_ID}`);
    }

    get value() {
        return this.#bool.value;
    }

    set value(value) {
        this.#bool.value = value;
    }
}


class ToggleField extends Field {

    #toggle;

    constructor(model, parent) {
        super(model, parent);
        if (model.input && !model.listener) {
            model.listener = () => model.input;
        }
        this.#toggle = new Toggle(model, this).attr('id', `_${_FIELD_ID}`);
    }

    get value() {
        return this.#toggle.value;
    }

    set value(value) {
        this.#toggle.value = value;
    }
}

class ImageUploader {

    #imageId;

    #panel;

    #button;

    constructor({ listener }) {
        const modal = new Modal({
            title: I18n.get('label.add_image'),
        });
        this.#panel = modal.addComponent(new UI('ui-flex-panel'))
        new Link({
            name: I18n.get('label.upload'),
            listener: () => {
                Http.upload({
                    type: 'COMMENT',
                    extensions: ['png', 'gif', 'jpg', 'jpeg', 'svg'],
                    listener: ({ id }) => this.image = id,
                });
            }
        }, this.#panel);
        new Message(I18n.get('label.re_help_img'), this.#panel);
        const ciu = new ClipboardImageUploader();
        ciu.start({
            listener: ({ id }) => this.image = id,
        });
        this.#button = modal.button({
            name: I18n.get('label.add'),
            listener: event => {
                listener(this.#imageId)
                modal.close();
            },
            disabled: true,
        });
    }

    set image(id) {
        this.#imageId = id;
        const img = this.#panel.query('img');
        if (img) {
            img.remove();
        }
        new UI('img', this.#panel).attr('src', `/r/image/get/${id}`).el.style.width = 'fit-content';
        this.#button.enable();
    }

}

class ClipboardImageUploader {

    start(option = {}) {
        document.onpaste = event => {
            if (option.onlyBody) {
                const { activeElement } = document;
                if (!activeElement || activeElement.tagName !== 'BODY') {
                    return;
                }
            }
            if (event.clipboardData) {
                const items = event.clipboardData.items;
                let item;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type === 'image/png') {
                        item = items[i];
                    }
                }
                if (item) {
                    const blob = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        const response = await Http.post('/r/clipboard', {
                            t: e.target.result,
                            type: option.type || 'BOOK'
                        });
                        if (option.listener) {
                            option.listener(response);
                        }
                    };
                    reader.readAsDataURL(blob);
                }
            }
        };
    }

    stop() {
        if (document.onpaste) {
            delete document.onpaste;
        }
    }

};


const IMAGE_LAZY_LOADER = {

    observe: images => {
        if (!images) {
            return;
        }
        if (images instanceof NodeList && !images.length) {
            return;
        }

        if (!IMAGE_LAZY_LOADER.observer) {
            IMAGE_LAZY_LOADER.observer = new IntersectionObserver(entries => {
                entries.forEach(each => {
                    const { target, isIntersecting } = each;
                    if (isIntersecting) {
                        IMAGE_LAZY_LOADER.observer.unobserve(target);
                        if (target.tagName === 'UI-JAVASCRIPT-MODULE') {
                            DomUtil.appendAfter(target, DomUtil.createElement('script', {
                                src: target.dataset.src,
                                type: 'module',
                            }));
                        } else {
                            DomUtil.appendAfter(target, DomUtil.createElement('img', {
                                src: target.dataset.src,
                                width: target.dataset.w,
                                height: target.dataset.h,
                            }));
                        }
                        target.remove();
                    }
                });
            }, {});
        }
        if (images instanceof Element) {
            IMAGE_LAZY_LOADER.observer.observe(images);
        } else {
            images.forEach(each => IMAGE_LAZY_LOADER.observer.observe(each));
        }
    }

}
class InlineTextEditor extends UI {

    #input;

    #value;

    constructor(model, parent) {
        super('ui-inline-input', parent);
        this.value = model.value || '';
        this.el.addEventListener('click', event => {
            if (this.#input) {
                return;
            }
            event.stopPropagation();
            this.clear();
            this.#input = new UI('input', this).attr('type', 'text');
            this.#input.el.value = this.#value;
            this.#input.on('keyup', event => {
                if (event.key === 'Enter') {
                    const v = this.#input.el.value;
                    if (model.listener(v)) {
                        this.#input.off('blur', blurListener);
                        this.#input = null;
                        this.value = v;
                    }
                } else if (event.key === 'Escape') {
                    this.#input.off('blur', blurListener);
                    this.#input = null;
                    if (model.cancel) {
                        model.cancel();
                    }
                    this.value = this.#value;
                }
            });
            const blurListener = this.#input.on('blur', () => {
                this.#input = null;
                this.value = this.#value;
            });
            setTimeout(() => this.#input.el.focus(), 100);
        });
    }

    enable() {
        this.el.click();
    }

    set value(v) {
        this.#value = v;
        this.html(v);
    }

}
class LabelPanel extends UI {

    #listener;

    #selected;

    #labels = [];

    constructor({ listener = un }, parent) {
        super('ui-labels', parent)
        this.#listener = listener;
    }

    setLabels(labels, value) {
        this.clear();
        const on = window.localStorage.getItem('hideLabelPanel') !== 'true';
        new Toggle({
            value: on,
            listener: async checked => this.toggles(checked),
        }, this);
        labels.forEach(each => {
            const label = new Label(each, this).hide().addClass('outlined');
            this.#labels.push(label);
            if (each.id === value) {
                (this.#selected = label).addClass('selected');
            }
            if (this.#listener) {
                label.on('click', () => {
                    if (this.#selected === label) {
                        label.removeClass('selected');
                        this.#selected = null;
                        this.#listener();
                    } else {
                        if (this.#selected) {
                            this.#selected.removeClass('selected');
                        }
                        (this.#selected = label).addClass('selected');
                        this.#listener(this.#selected.id);
                    }
                });
            }
        });
        this.toggles(on);
    }

    get selected() {
        return this.#selected ? this.#selected.id : null;
    }

    toggles(on) {
        this.#labels.forEach(each => {
            if (on || each.hasClass('selected')) {
                each.show();
            } else {
                each.hide();
            }
        });
        if (on) {
            window.localStorage.removeItem('hideLabelPanel');
        } else {
            window.localStorage.setItem('hideLabelPanel', 'true');
        }
    }
}

class Labels extends UI {

    constructor({ labels, listener = undefined }, parent) {
        super('ui-labels', parent);
        if (!labels) {
            return;
        }
        labels.forEach(each => {
            const label = new Label(each, this);
            if (listener) {
                label.on('click', () => Labels.load(label, `/r/see_also/label/${each.id}`));
            }
        });
    }

    static async load(label, url) {
        const option = Applications.getOption();
        if (option && option.exportType === 'HTML') {
            return;
        }
        const response = await Http.get(url);
        const fp = new FloatingPanel();
        fp.el.style.padding = '1rem';
        if (response.length) {
            const tree = new Tree(fp);
            response.forEach(each => {
                let name = Icon.getDocumentIcon(each.type, each.title);
                const bookNode = tree.add({
                    name,
                    listener: () => window.open(`/r/document/view/${each.id}`),
                }, true);
                if (each.children) {
                    each.children.forEach(chapter => {
                        const chapterNode = bookNode.add({
                            name: new UI('ui-icon-article').html(chapter.title),
                            listener: () => window.open(`/r/document/view/${chapter.id}`),
                        }, true);
                        if (chapter.children) {
                            chapter.children.forEach(element => {
                                chapterNode.add({
                                    name: element.description || element.title || element.id,
                                    listener: () => window.open(`/r/document/view/${element.id}`),
                                }, true);
                            });
                        }
                    });
                }
            });
        } else {
            new Message(I18n.get('label.empty_row'), fp);
        }
        fp.open(label);
    }

}

class Label extends UI {

    #id;

    constructor({ id, name, color = 'BLUE', icon, count }, parent) {
        super('ui-label', parent);
        this.#id = id;
        this.el.dataset.id = id;
        this.attr('title', name);
        if (color) {
            this.el.dataset.color = color;
        }
        if (icon) {
            new Icon(icon, this);
        }
        let html = name;
        if (count > 1) {
            html += ` x ${count}`
        }
        new UI('b', this).plain(html);
    }

    get id() {
        return this.#id;
    }

}
class GridLayout extends UI {

    constructor(model, parent) {
        super('ui-grid-layout', parent);
        this.css(model);
    }

    add(ui, gridRow, gridColumn) {
        this.append(ui);
        ui.css({
            gridRow,
            gridColumn,
        });
    }

}
class Link extends UI {

    constructor(model, parent) {
        super('a', parent);
        let href = model.href || '#';
        this.el.href = href;
        if (model.name instanceof UI) {
            this.append(model.name);
        } else {
            this.plain(model.name || '');
        }
        if (model.openInNew) {
            this.append(document.createTextNode('...'));
            this.attr('target', '_blank');
            this.attr('rel', 'noopener');
        } else if (href !== '#' && !model.listener) {
            new Icon({
                icon: 'open_in_new',
                title: I18n.get('label.open_link_in_new_window'),
                listener: event => {
                    event.stopPropagation();
                    event.preventDefault();
                    window.open(href);
                }
            });
            this.on('click', event => {
                event.stopPropagation();
            });
        }
        if (model.listener) {
            if (model.listener.constructor.name === 'AsyncFunction') {
                model.spin = true;
            }
            this.el.addEventListener('click', event => {
                event.preventDefault();
                if (model.spin) {
                    this.spin(event, model.listener);
                } else {
                    model.listener(event, this);
                }
            });
        }
    }

    async spin(event, handler) {
        this.disable();
        const spinner = new Spinner(this);
        try {
            await handler(event, this);
        } finally {
            spinner.remove();
            this.enable();
        }
    }

    set name(name) {
        this.html(name);
    }

}

class LinkSelector extends UI {

    #span;

    constructor(model, parent) {
        super('ui-link-selector', parent);
        this.#span = this.child('span');
        if (model.name) {
            this.#span.html(model.name);
        }
        new Link({
            name: model.placeholder,
            openInNew: true,
            listener: () => model.listener(this),
        }, this);
    }

    setName(name) {
        this.#span.html(name);
    }

}
class ListItem extends UI {

    constructor(option, parent) {
        super('ui-list-item', parent);
        const p = new UI('p', this);
        let value;
        if (option instanceof UI) {
            value = option;
        } else if (typeof option.render === 'function') {
            value = option.render(p);
        } else if (Array.isArray(option)) {
            value = option;
        }
        if (Array.isArray(value)) {
            value.forEach(each => p.append(each));
        } else if (value instanceof UI) {
            p.append(value);
        }
    }

    enable() {
        this.removeClass('disabled');
    }

    disable() {
        this.addClass('disabled');
    }

}

class List extends UI {

    #items = new Map();

    #option;

    #selected;

    #section;

    constructor(option, parent) {
        super('ui-list', parent);
        this.#option = option || {};
        if (this.#option.enableFilter) {
            new SearchBox({
                listener: ({ query }) => {
                    if (query) {
                        const exp = new RegExp(query, 'gi');
                        this.all().forEach(each => {
                            exp.lastIndex = 0;
                            if (each.filter(exp)) {
                                each.show('flex');
                            } else {
                                each.hide();
                            }
                        });
                    } else {
                        this.all().forEach(each => each.show('flex'));
                    }
                }
            }, this);
        }
        this.#section = new UI('section', this);
        this.#section.addClass('mouseover-scrollbar');
    }

    clear() {
        this.#section.clear();
    }

    add(p) {
        if (p instanceof ListItem) {
            this.#section.append(p);
            this.configure(p);
            return p;
        } else if (typeof p === 'string') {
            return new ListItem(new Plain(p), this.#section);
        } else {
            return new ListItem(p, this.#section);
        }
    }

    configure(p) {
        this.#items.set(p.id, p);
        if (p.selected) {
            p.on('click', event => {
                event.stopPropagation();
                this.select(p);
            });
        }
        if (p.more && !this.#option.disableMore) {
            p.query('p').append(Icon.contextMenu(cm => p.more(cm)).el);
        }
    }

    all() {
        return [...this.#items.values()]
    }

    get(id) {
        return this.#items.get(id);
    }

    select(p) {
        if (typeof p === 'string') {
            p = this.get(p);
        }
        if (!p || this.#selected === p) {
            return;
        }
        if (this.#selected) {
            this.#selected.removeClass('selected');
        }
        (this.#selected = p).addClass('selected');
        p.selected();
    }

    selected() {
        return this.#selected;
    }

    getSelected() {
        return this.#selected;
    }

}
window.LoginPageLoader = class {

    constructor(app, parameter) {
        app.add(new LoginModule(parameter));
    }

}

class LoginModule extends UI {

    constructor({ path, logo, byEmail, emailEnabled, banners, ...parameter }, listener) {
        super('ui-login');
        new Link({
            name: new UI('img').attr('src', logo),
            href: '/',
        }, this).addClass('logo');

        const tab = new Tab({}, this);
        tab.add(I18n.get('label.login'), () => {
            const afterLogin = () => {
                if (listener) {
                    listener();
                } else if (path) {
                    if (path === '/!') {
                        window.location.reload();
                    } else {
                        window.location.href = path;
                    }
                } else if (window.location.pathname === '/r/signon/login') {
                    window.location.replace('/');
                } else {
                    window.location.reload();
                }
            };
            const submit = async (event, rememberMe) => {
                event && event.preventDefault();
                const response = await Http.post(`/r/signon/submit`, {
                    userid: userid.el.value,
                    password: password.el.value,
                    rememberMe,
                });
                if (response.error) {
                    Messages.showAutoClose(response.error);
                } else {
                    if (parameter.tfa) {
                        tab.remove();
                        const profile = await Http.get('/r/2fa/profile');
                        new TwoFactorAuthenticator(profile, afterLogin, this);
                    } else {
                        afterLogin();
                    }
                }
            };

            const result = new UI('div').addClass('flex', 'flex-col', 'gap-16', 'mt-4');
            const form = new UI('form', result).addClass('flex', 'flex-col', 'gap-6');
            form.on('submit', event => submit(event, false));
            form.attr('autocomplete', 'off');
            const userid = new UI('input', form).attr('placeholder', I18n.get(byEmail ? 'label.email' : 'label.userid')).attr('autocomplete', 'username').attr('type', 'text');
            const password = new UI('input', form).attr('placeholder', I18n.get('label.password')).attr('autocomplete', 'current-password').attr('type', 'password');
            new UIArray([
                () => {
                    if (!parameter.tfa && !parameter.disableKeepMeLoggedIn) {
                        return new Button({
                            name: I18n.get('label.keep_me_logged_in'),
                            listener: async event => await submit(event, true),
                        });
                    }
                },
                new Button({
                    name: I18n.get('label.login'),
                    listener: async event => await submit(event, false),
                }),
            ], form).addClass('buttons');

            if (parameter.supportExternalLogin) {
                const openLogins = new UI('div', result).addClass('open_login_panel');
                new UIArray([
                    new UI('hr'),
                    new Plain(I18n.get('label.or')),
                    new UI('hr'),
                ], openLogins);
                new UIArray([
                    () => {
                        if (parameter.supportFacebookLogin) {
                            return new Link({
                                listener: () => new BaseOAuthFacebook(() => afterLogin()),
                            }).addClass('facebook', 'hover:scale-105').attr('title', I18n.get('label.login_with_facebook'));
                        }
                    },
                    () => {
                        if (parameter.supportGoogleLogin) {
                            return new Link({
                                listener: () => new BaseOAuthGoogle(() => afterLogin()),
                            }).addClass('google', 'hover:scale-105').attr('title', I18n.get('label.login_with_google'));
                        }
                    },
                    () => {
                        if (parameter.supportNaverLogin) {
                            return new Link({
                                listener: () => new BaseOAuthNaver(() => afterLogin()),
                            }).addClass('naver', 'hover:scale-105').attr('title', I18n.get('label.login_with_naver'));;
                        }
                    },
                ], openLogins);
            }
            setTimeout(() => {
                userid.el.focus();
            }, 100);
            return result;
        });
        if (byEmail) {
            tab.add(I18n.get('label.sign_up'), () => {
                const form = new Form().addClass('flex', 'flex-col', 'gap-4', 'mt-4');
                let field = new Fields({ form }, form);
                field.text({
                    name: 'name',
                    required: true,
                });
                field.text({
                    name: 'email',
                    required: true,
                });
                field.password({
                    name: 'password',
                    required: true,
                });
                field.password({
                    name: 'retypePassword',
                    required: true,
                });

                if (parameter.service) {
                    const enable = () => {
                        if (termsOfService.value && privacyPolicy.value && (!parameter.sitekey || localStorage.getItem('recaptcha-token'))) {
                            button.enable();
                        } else {
                            button.disable();
                        }
                    };
                    field = new Fields({ form }, form);
                    field.type = 'option';
                    const termsOfService = field.bool({
                        name: 'termsOfService',
                        label: I18n.get('label.accept_terms_of_service'),
                        listener: () => enable(),
                    });
                    const privacyPolicy = field.bool({
                        name: 'privacyPolicy',
                        label: I18n.get('label.accept_privacy_policy'),
                        listener: () => enable(),
                    });
                    field.bool({
                        name: 'acceptEmail',
                    });
                    new Message(I18n.get('label.accept_email_tip'), form);

                    if (parameter.sitekey) {
                        localStorage.removeItem('recaptcha-token');
                        new UI('div', form).addClass('g-recaptcha', 'mt-4').attr('data-sitekey', parameter.sitekey).attr('data-callback', 'recaptcha');
                        window.recaptchaEnable = () => enable();
                    }
                }

                const button = new Button({
                    name: I18n.get('label.sign_up'),
                    disabled: parameter.service || parameter.sitekey,
                    listener: async () => {
                        const parameter = form.parameter;
                        if (parameter) {
                            parameter.referrer = localStorage.getItem('referrer');
                            parameter.recaptchaToken = localStorage.getItem('recaptcha-token');
                            await Http.post('/r/signup/create', parameter);
                            localStorage.removeItem('recaptcha-token');
                            // userid.el.value = parameter.email;
                            tab.select(0);
                        }
                    },
                });

                setTimeout(() => {
                    new UI('script', document.body).attr('src', 'https://www.google.com/recaptcha/api.js').attr('async', 'async').attr('defer', 'defer');
                }, 100);

                new ButtonPanel(form, [button,]);
                return form;
            });
        }

        if (emailEnabled) {
            tab.add(I18n.get('label.forgot_your_password'), () => {
                const result = new UI('div').addClass('flex', 'flex-col', 'gap-4', 'mt-4');
                new Message(I18n.get(byEmail ? 'label.find_account_password_tip' : 'label.find_user_password_tip'), result);
                const userid = new UI('input').attr('type', 'text');
                new UIArray([
                    userid,
                    new Button({
                        name: I18n.get('label.init'),
                        listener: async () => {
                            const response = await Http.post('/r/forgot_password/reset', {
                                userid: userid.el.value,
                            });
                            Messages.showAutoClose(response.message || response.error);
                        },
                    }),
                ], result);
                return result;
            });
        }
        tab.select(0);
        new BannerManager().open(banners, this);
    }

}

window.recaptcha = token => {
    localStorage.setItem('recaptcha-token', token);
    if (window.recaptchaEnable) {
        window.recaptchaEnable();
    }
};

class TwoFactorAuthenticator extends UI {

    constructor({ email, period }, afterLogin, parent) {
        super('div', parent);
        this.addClass('flex', 'flex-col', 'gap-4');
        new UI('h1', this).html(I18n.get('label.check_your_email')).addClass('font-bold', 'text-xl');
        new Message({ content: I18n.get('label.enter_verification_code', email) }, this);
        const codes = [];
        const ua = new UIArray([], this);
        for (let i = 0; i < 6; i++) {
            const input = new UI('input');
            input.el.maxLength = 1;
            input.el.value = '';
            input.on('keyup', ({ keyCode }) => {
                if ((keyCode >= 48 && keyCode <= 57) ||
                    (keyCode >= 96 && keyCode <= 105)) {
                    if (period < 1 || codes.filter(each => !each.el.value).length) {
                        button.disable();
                    } else {
                        button.enable();
                    }
                    if (i < 5) {
                        codes[i + 1].el.select();
                    } else {
                        button.el.click();
                    }
                }
            });
            input.addClass('w-8', 'h-8', 'text-center');
            ua.add(codes[i] = input);
        }

        const button = new Button({
            name: I18n.get('label.verify'),
            disabled: true,
            listener: async () => {
                if (period > 0) {
                    const code = codes.map(each => each.el.value).join('');
                    const response = await Http.post(`/r/2fa/verify/${code}`);
                    if (response.error) {
                        Messages.showAutoClose(response.error);
                    } else {
                        afterLogin();
                    }
                }
            },
        });

        const span = new UI('span');
        const f = () => {
            --period;
            if (period > 0) {
                span.html(`${period}${I18n.get('label.second')}`);
            } else {
                span.html(I18n.get('label.time_expired'));
            }
        }
        setInterval(f, 1000);
        f();

        new UIArray([
            button,
            span,
            new Link({
                name: I18n.get('label.resend_code'),
                listener: async () => {
                    const response = await Http.get('/r/2fa/resend');
                    codes.forEach(each => each.el.value = '');
                    period = response.period;
                },
            }),
        ], this);
    }

}
class LogoSetter extends Drawer {

    #id;

    #imagePanel;

    #img;

    #holder;

    constructor(id, holder) {
        super({
            title: I18n.get('label.set_logo'),
            block: true,
            actions: [
                new Link({
                    name: I18n.get('label.select'),
                    listener: () => this.select(),
                }),
                new Link({
                    name: I18n.get('label.remove'),
                    listener: () => {
                        Http.post(`/r/book_logo/unset/${this.#id}`);
                        this.img = '';
                    },
                }),
            ]
        });
        this.#id = id;
        this.#holder = holder;
        const { backgroundImage } = holder.style;
        if (backgroundImage) {
            this.img = backgroundImage;
        }
    }

    select() {
        if (!this.#imagePanel) {
            this.#imagePanel = new ImagePanel((image, id) => {
                this.img = image;
                Http.post(`/r/book_logo/set/${this.#id}`, {
                    logo: id,
                });
            });
        }
        this.#imagePanel.show();
    }

    set img(backgroundImage) {
        if (!this.#img) {
            this.#img = new UI('ui-logo', this);
        }
        this.#img.css({
            backgroundImage,
        });
        this.#holder.style.backgroundImage = backgroundImage;
    }

}
const Messages = {

    show: model => {
        if (!Messages.PANEL) {
            Messages.PANEL = new MessagePanel();
        }
        return Messages.PANEL.add(model);
    },

    showAutoClose: model => {
        if (typeof model === 'string') {
            model = {
                content: model,
            }
        }
        model.autoClose = true;
        return Messages.show(model);
    },

}

class MessagePanel extends UI {

    constructor() {
        super('ui-message-panel', document.body);
        this.addClass('mouseover-scrollbar');
    }

    add(model) {
        if (typeof model === 'string') {
            model = {
                content: model,
            };
        }
        model.type = 'dark';
        return new Message(model, this);
    }

}

class Message extends UI {

    constructor(model, parent) {
        super('ui-message', parent);
        if (model.type) {
            this.addClass(model.type);
        }
        if (model.icon) {
            new Icon(model.icon, this);
        } else if (model.progress) {
            new Spinner(this);
        }
        if (model instanceof UI) {
            this.append(model);
        } else if (model.content instanceof UI) {
            this.append(model.content);
        } else {
            let content;
            if (typeof model === 'string') {
                content = model;
            } else {
                content = model.content;
            }
            this.child('span').html(content);
        }
        if (model.autoClose) {
            this.css({
                animationDuration: '2000ms',
                animationDelay: '1000ms',
            });
            Animcation.fadeOut(this);

        }
        if (model.closable) {
            this.addClass('closable');
            new Icon({
                icon: 'close',
                listener: event => this.remove(),
            }, this).addClass('close');
        }
    }

    set content(content) {
        this.query('span').innerHTML = content;
    }

}
window.modalManagerCount = 5;

class Modal extends UI {

    #container;

    #header;

    #main;

    #footer;

    #closable;

    #bind;

    constructor(model) {
        super('ui-modal');
        this.attr('tabindex', 0);
        if (model.closable) {
            this.#closable = model.closable;
        }
        this.#container = new UI('ui-modal-container', document.body);
        this.#container.append(this);
        this.#container.css({
            zIndex: ++window.modalManagerCount,
        });
        new Icon({
            icon: 'close',
            listener: this.close.bind(this),
        }, this);
        this.#header = this.child('header');
        this.#header.child('h1', h1 => {
            if (model.title instanceof UI) {
                h1.append(model.title);
            } else {
                h1.plain(model.title || '');
            }
        });
        if (!model.fullscreen) {
            this.enableMove(this.#header);
        }
        if (!model.title) {
            this.#header.addClass('hidden');
        }
        this.#main = this.child('main');
        if (model.fullscreen) {
            this.el.style.bottom = '1rem';
            this.el.style.left = '1rem';
            this.el.style.right = '1rem';
            this.el.style.top = '1rem';
            this.#main.css({
                maxHeight: `calc(100dvh - 4.5rem)`,
            });
            if (!model.title) {
                this.addClass('withoutTitle');
            }
        }
        this.#main.addClass('mouseover-scrollbar');
        if (model.page) {
            this.#main.append(model.page);
            this.addClass('modal_page');
        }
        this.on('keyup', ({ key }) => {
            if (key === 'Escape') {
                this.close();
            }
        });
    }

    get main() {
        return this.#main;
    }

    set bind(bind) {
        this.#bind = bind;
    }

    set title(title) {
        if (title) {
            this.#header.removeClass('hidden');
            this.#header.query('h1').innerHTML = title;
        } else {
            this.#header.addClass('hidden');
        }
    }

    enableMove(header) {
        header.el.style.cursor = 'move';
        header.on('mousedown', event => {
            let { left, top } = this.el.getBoundingClientRect();
            let { x, y } = event;
            const move = (event) => {
                left += event.x - x;
                top += event.y - y;
                x = event.x;
                y = event.y;
                this.el.style.left = `${left}px`;
                this.el.style.top = `${top}px`;
            };
            const up = (event) => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        });
    }

    close() {
        if (!this.#closable || this.#closable()) {
            if (this.#bind) {
                this.hideModal();
                if (this.modalClosed) {
                    this.modalClosed();
                }
            } else {
                this.#container.remove();
                if (this.modalClosed) {
                    this.modalClosed();
                }
            }
        }
    }

    closeAlways() {
        if (this.#bind) {
            this.hideModal();
            if (this.modalClosed) {
                this.modalClosed();
            }
        } else {
            this.#container.remove();
            if (this.modalClosed) {
                this.modalClosed();
            }
        }
    }

    button(buttonModel) {
        if (!this.#footer) {
            this.#footer = this.child('footer');
        }
        return new Button(buttonModel, this.#footer);
    }

    add(component) {
        this.#main.append(component);
    }

    addComponent(component) {
        this.add(component);
        return component;
    }

    reattach() {
        document.body.append(this.#container.el);
        this.#container.css({
            zIndex: ++window.modalManagerCount,
        });
    }

    detach() {
        this.#container.remove();
    }

    showModal() {
        this.#container.show();
        this.#container.css({
            zIndex: ++window.modalManagerCount,
        });
        this.focus();
    }

    hideModal() {
        this.#container.hide();
    }

    async skeleton(loader, size = 2, message) {
        this.main.skeleton(loader, size, message);
    }

}

const ModalManager = {

    modals: new Map(),

    open: (id, loader) => {
        const modals = ModalManager.modals;
        if (modals.has(id)) {
            const result = modals.get(id);
            result.showModal();
            return result;
        } else {
            const result = loader();
            result.bind = true;
            modals.set(id, result);
            result.showModal();
            return result;
        }
    },

    get: id => {
        return modals.get(id);
    },

}
class LabelDescriptionUpdater extends Modal {

    constructor(model) {
        super({ title: I18n.get('label.description_placeholder'), });
        this.skeleton(async () => {
            const response = await Http.get(`/r/label/get_description/${model.id}/${model.targetId}`);
            const textarea = new UI('textarea');
            textarea.el.value = response.description || '';
            this.add(textarea);
            this.button({
                name: I18n.get('label.save'),
                listener: async () => {
                    await Http.post('/r/label/update_description', {
                        ...model,
                        description: textarea.el.value,
                    });
                    this.close();
                },
            });
            textarea.el.focus();
        }, 4);
    }

}
class Navigator extends UI {

    #items = new Map();

    #submenuPanel;

    #submenuOpenOnMouseoverDisabled;

    #overflowedContextMenu;

    #opened;

    constructor(model, parent) {
        super('ui-navigator', parent);
        this.addClass('mobile-scroll');
        const { align, height, gap = 'normal', submenuOpenOnMouseoverDisabled, css } = model;
        if (align === 'center') {
            this.addClass('justify-center');
        } else if (align === 'right') {
            this.addClass('justify-end');
        }
        if (height && height !== 'xs') {
            DomUtil.addClass(document.body, height);
        }
        this.addClass(`gap_${gap}`);
        this.#submenuOpenOnMouseoverDisabled = submenuOpenOnMouseoverDisabled;
        model.items.forEach(each => each.ui = new NavigatorItem(each, this, this));
        if (css) {
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        }
        this.resized(model);
        const observer = new ResizeObserver(() => this.resized(model));
        observer.observe(this.el);
    }

    get(id) {
        return this.#items.get(id);
    }

    set(id, item) {
        this.#items.set(id, item);
    }

    resized(model) {
        const maxWidth = document.body.getBoundingClientRect().width;
        let overflowed = false;
        let sumOfWidth = 200;
        model.items.forEach(each => {
            const item = each.ui;
            const { x, width } = item.el.getBoundingClientRect();
            sumOfWidth += width;
            if (!overflowed && sumOfWidth > maxWidth) {
                overflowed = true;
            }
            each.overflowed = overflowed;
        });
        if (this.#overflowedContextMenu) {
            this.#overflowedContextMenu.remove();
        }
        const { align, } = model;
        if (overflowed) {
            if (align === 'center') {
                this.removeClass('justify-center');
            } else if (align === 'right') {
                this.removeClass('justify-end');
            }
            this.#overflowedContextMenu = new ContextMenu({
                type: ContextMenuType.MORE,
            }, this).addClass('more');
            model.items.filter(each => each.overflowed).forEach(each => {
                this.#overflowedContextMenu.add({
                    name: each.name,
                    listener: () => each.ui.open(each),
                })
            });
        } else {
            if (align === 'center') {
                this.addClass('justify-center');
            } else if (align === 'right') {
                this.addClass('justify-end');
            }
        }
    }

    get submenuOpenOnMouseoverDisabled() {
        return this.#submenuOpenOnMouseoverDisabled;
    }

    get opened() {
        return this.#opened;
    }

    set opened(opened) {
        this.#opened = opened;
    }

    toggle(submenuPanel) {
        if (this.#submenuPanel) {
            this.#submenuPanel.close();
        }
        this.#submenuPanel = submenuPanel;
    }

    clearSubmenu() {
        if (this.#submenuPanel) {
            this.#submenuPanel.close();
            this.#submenuPanel = null;
        }
        this.#opened = null;
    }

}

class NavigatorItem extends UI {

    #navigator = navigator;

    constructor(model, navigator, parent) {
        super('ui-navigator-item', parent);
        this.#navigator = navigator;
        if (model.id) {
            this.attr('id', model.id);
            navigator.set(model.id, this);
        }
        if (model.type === 'HTML') {
            this.html(model.description);
            return;
        }

        if (model.color) {
            this.el.dataset.color = model.color;
        }
        const header = new UI('header', this);
        if (model.icon) {
            const i = new Icon(model.icon, header);
            if (model.color) {
                i.addClass('fill');
            }
        } else if (!(parent instanceof Navigator)) {
            const i = new Icon('', header);
        }
        if (!model.showOnlyIcon) {
            const div = new UI('div', header);
            const span = new UI('span', div).html(model.name);
            if (model.type === 'GROUP') {
                span.css({
                    color: 'var(--link-hover-color)',
                });
            }
        }
        if (!(parent instanceof Navigator) && model.description) {
            const p = new UI('p', this).plain(model.description);
        }
        if (model.disabled) {
            this.disable();
        }
        if (model.selected) {
            this.addClass('selected');
        }
        if (model.fillWidth) {
            this.addClass('mr-auto');
        }
        if (model.children) {
            if (model.type === 'GROUP') {
                const section = new UI('section', this);
                model.children.forEach(each => {
                    const item = new NavigatorItem(each, navigator, section);
                });
            } else {
                new Icon('keyboard_arrow_down', header);
            }
        }
        if (model.type !== 'GROUP' && model.type !== 'HTML') {
            this.addClass('actionable');
            this.on('click', () => {
                if (this.hasClass('disabled')) {
                    return;
                }
                this.open(model, parent);
            });
            if (!parent.submenuOpenOnMouseoverDisabled) {
                this.on('mouseover', () => this.openSubmenu(model));
            }
        } else {
            this.el.style.cursor = 'default';
        }
    }

    open(model, parent) {
        if (model.listener) {
            model.listener();
            this.#navigator.clearSubmenu();
        } else if (model.url) {
            if (model.target) {
                window.open(model.url);
            } else {
                const url = model.url;
                const option = Applications.getOption();
                if (option && url.includes('#') && model.bookId && document.body.dataset.bookId === model.bookId) {
                    const c = Applications.getController();
                    if (c && c.open) {
                        const i = url.indexOf('#');
                        c.open(url.substring(i + 1));
                    }
                } else {
                    window.location.href = url;
                }
            }
            if (parent) {
                if (parent instanceof FloatingPanel) {
                    parent.close();
                } else if (parent.parent instanceof FloatingPanel) {
                    parent.parent.close();
                }
            }
            this.#navigator.clearSubmenu();
        } else {
            this.openSubmenu(model);
        }
    }

    openSubmenu(model) {
        const { children, useLastColumnAsFooter, } = model;
        if (!children) {
            return;
        }
        if (this === this.parent.opened) {
            this.parent.opened = null;
            return;
        }
        const fp = new FloatingPanel();
        this.parent.toggle(fp);
        if (children.length === 1) {
            fp.addClass('single_navigator_floating_panel');
            children[0].children.forEach(each => new NavigatorItem(each, this.#navigator, fp));
            fp.open(this.el);
        } else {
            fp.addClass('multi_navigator_floating_panel', 'mobile-scroll');
            if (useLastColumnAsFooter) {
                fp.addClass('use_last_column_as_footer')
            }
            fp.addClass(`gap_${model.gap}`);
            children.forEach((group, i) => {
                const div = new UI('div', fp);
                group.children.forEach(each => new NavigatorItem(each, this.#navigator, div));
                if (useLastColumnAsFooter && i == children.length - 1) {
                    div.addClass('mobile-scroll');
                }
            });
            const rect = this.el.getBoundingClientRect();
            fp.open(0, rect.y + rect.height);
        }
        setTimeout(() => {
            fp.on('mouseleave', () => {
                fp.remove();
                this.parent.opened = false;
            })
        }, 400);
        this.parent.opened = this;
    }

    enable() {
        this.removeClass('disabled');
    }

    disable() {
        this.addClass('disabled');
    }

}

class PageNavigation extends UI {
    constructor({ value, listener }, parent) {
        super('ui-page-navigation', parent);
        this.addClass('flex', 'gap-4', 'justify-center');
        const { values, page, totalPage } = value;
        if (!values || !values.length) {
            new Message(I18n.get('label.empty_row'), this);
        } else {
            const pages = [];
            if (page > 1) {
                pages.push({
                    page: page - 1,
                    name: I18n.get('label.previous'),
                });
            }
            let i = Math.max(1, page - 5);
            let last = Math.min(totalPage + 1, i + 10);
            for (; i < last; i++) {
                pages.push({
                    page: i,
                    name: i,
                    current: i === page,
                });
            }
            if (page < totalPage) {
                pages.push({
                    page: page + 1,
                    name: I18n.get('label.next'),
                });
            }
            pages.forEach(({ name, page, current }) => {
                if (current) {
                    new UI('b', this).plain(name);
                } else {
                    new Link({
                        name,
                        listener: () => listener(page),
                    }, this);
                }
            });
        }
    }
}
class BaseOAuth {

  constructor(callback) {
    this.callback = callback;
    const id = setInterval(() => {
      if (!this.child && !this.child.window) {
        return;
      }
      const hash = this.child.window.location.hash;
      if (hash === "#success") {
        clearInterval(id);
        this.child.close();
        this.callback();
      }
    }, 300);
  }

  open(path) {
    this.child = window.open(path, "", "width=970, height=650");
  }

};

class BaseOAuthFacebook extends BaseOAuth {

  constructor(callback) {
    super(callback);
    this.open("/r/oauth/facebook");
  }

};

class BaseOAuthGoogle extends BaseOAuth {

  constructor(callback) {
    super(callback);
    this.open("/r/oauth/google");
  }

};

class BaseOAuthNaver extends BaseOAuth {

  constructor(callback) {
    super(callback);
    this.open("/r/oauth/naver");
  }

};
const Option = {

    get: (key, defaultValue) => {
        return window.sessionStorage.getItem(key) || defaultValue;
    },

    getNumber: (key, defaultValue) => {
        const result = window.sessionStorage.getItem(key);
        return result ? Number(result) : defaultValue;
    },

    set: (key, value) => {
        if (value) {
            window.sessionStorage.setItem(key, value);
        } else {
            window.sessionStorage.removeItem(key);
        }
    },

};

const BrowserOption = {

    get: (key, defaultValue) => {
        return window.localStorage.getItem(key) || defaultValue;
    },

    isTrue: (key, defaultValue) => {
        const result = window.localStorage.getItem(key);
        return result === 'true' ? true : defaultValue;
    },

    set: (key, value) => {
        if (value) {
            window.localStorage.setItem(key, value);
        } else {
            window.localStorage.removeItem(key);
        }
    },

};

class SingleOptionSelector extends UI {

    constructor(model, parent) {
        super('ui-single-option-selector', parent);
        model.options.forEach(each => {
            const option = new UI('div', this).plain(each.name);
            option.on('click', () => {
                if (model.listener) {
                    model.listener(each);
                }
            });
        });
    }

}
const Pages = {
    open: (id, creator) => {
        const page = creator();
        Applications.set(ComponentType.PAGE, page);
        Applications.getApplication().main.append(page);
    },
};

class Page extends UI {
    constructor(option = {}, parent) {
        super('ui-page', parent);
        if (option.confined) {
            this.addClass('confined');
        }
    }
}

class ConfinedPage extends Page {
    constructor(parent) {
        super({ confined: true }, parent);
    }
}

class SubPage extends UI {
    constructor(parent) {
        super('ui-sub-page', parent);
    }
}
class PageHeader extends UI {

    #icon;

    constructor(model, parent) {
        super('ui-page-header', parent);
        this.#icon = new Icon(model.icon || 'article', this);
        if (model.color) {
            this.#icon.el.dataset.color = model.color;
        }
        this.child('header', header => {
            if (Array.isArray(model.title)) {
                header.child('h1', h1 => {
                    const array = new UIArray({}, h1).addClass('mobile-scroll');
                    model.title.forEach(each => {
                        if (each instanceof Function) {
                            const result = each();
                            if (result) {
                                array.append(result);
                            }
                        } else if (typeof each === 'string') {
                            array.add(new UI('span').plain(each));
                        } else {
                            array.add(each);
                        }
                    });
                });
            } else if (model.title instanceof UI) {
                header.child('h1').append(model.title);
            } else {
                header.child('h1').plain(model.title || '');
            }
            if (model.subtitle) {
                if (typeof model.subtitle === 'function') {
                    model.subtitle = model.subtitle();
                }
                if (Array.isArray(model.subtitle)) {
                    const h2 = header.child('h2').addClass('mobile-scroll');
                    model.subtitle.forEach(each => {
                        if (each instanceof Function) {
                            const result = each();
                            if (result) {
                                h2.append(result);
                            }
                        } else {
                            h2.append(each);
                        }
                    });
                } else if (model.subtitle instanceof UI) {
                    header.append(model.subtitle);
                } else {
                    header.child('h2').addClass('mobile-scroll').html(model.subtitle);
                }
            };
        })
    }

    get icon() {
        return this.#icon;
    }

    set title(t) {
        const h1 = this.query('h1');
        if (t instanceof UI) {
            h1.innerText = '';
            h1.append(t.el);
        } else {
            h1.innerText = t;
        }
    }

}

class SimplePageHeader extends UI {

    constructor(model, parent) {
        super('ui-simple-page-header', parent);
        new Link({
            name: I18n.get('label.back'),
            listener: () => window.history.back(),
        }, this);
        new UI('h1', this).html(model.title);
    }

}
class FloatingPanel extends UI {

    #base;

    #minWidth;

    #close;

    constructor({ base, minWidth = 0, closable = false } = {}) {
        super('ui-floating-panel', base || document.body);
        this.addClass('mouseover-scrollbar');
        this.#base = base;
        this.#minWidth = minWidth;
        if (this.#base) {
            this.el.style.position = 'absolute';
        }
        this.#close = (event) => {
            if (event.target.closest('ui-floating-panel') === this.el) {
                return;
            }
            this.close();
        };
        if (closable) {
            this.addClass('closable');
            new Icon({
                icon: 'close',
                title: I18n.get('label.close'),
                listener: () => this.close(),
            }, this);
        }

        setTimeout(() => document.body.addEventListener('click', this.#close, true), 100);
    }

    open(x, y, type) {
        if (x instanceof UI) {
            x = x.el;
        }
        if (x instanceof Element) {
            const rect = x.getBoundingClientRect();
            x = rect.x;
            y = rect.y + rect.height;
        }
        if (this.#minWidth) {
            this.el.style.width = `${this.#minWidth - 1}px`;
            if (document.body.clientWidth - x < this.#minWidth) {
                x = document.body.clientWidth - this.#minWidth;
            }
        }
        if (this.#base) {
            const rect = this.#base.getBoundingClientRect();
            x -= rect.x;
            y -= rect.y;
        }

        if (type === 'ContextMenu' && document.body.clientHeight * 2 / 3 < y) {
            this.el.style.bottom = `${document.body.clientHeight - y}px`;
            this.el.style.top = `auto`;
            if (!this.#base) {
                this.el.style.maxHeight = `calc(60dvh)`;
            }
        } else {
            this.el.style.top = `${y + 1}px`;
            if (!this.#base) {
                this.el.style.maxHeight = `calc(100dvh - ${y + 8}px)`;
            }
        }
        const maxWidth = document.body.getBoundingClientRect().width;
        if ((maxWidth - x) < 200) {
            x = 8;
            this.el.style.right = `${x}px`;
            this.el.style.left = `auto`;
        } else {
            this.el.style.left = `${x}px`;
            this.el.style.right = `auto`;
        }
        this.css({
            zIndex: ++window.modalManagerCount,
        });
        return this;
    }

    close() {
        this.remove();
        document.body.removeEventListener('click', this.#close, true);
    }

}
class LazyPanel extends UI {

    #builder;

    constructor(builder, parent) {
        super('div', parent);
        this.#builder = builder;
    }

    run() {
        return this.#builder();
    }

}
class SwitchPanel extends UI {

    #attach;

    #panels = new Map();

    #selectedPanel;

    constructor({ attach = true }, parent) {
        super('ui-switch-panel', parent);
        this.#attach = attach;
    }

    get selected() {
        return this.#selectedPanel;
    }

    has(id) {
        return this.#panels.has(id);
    }

    add(id, loader, open = false) {
        this.#panels.set(id, loader);
        if (open) {
            this.get(id);
        }
    }

    get(id) {
        let result = this.#panels.get(id);
        if (this.#selectedPanel) {
            if (result === this.#selectedPanel) {
                return result;
            }
            if (this.#attach) {
                this.#selectedPanel.detach();
            } else {
                this.#selectedPanel.hide();
            }
        }
        if (result instanceof UI) {
            if (result.hasParent()) {
                if (this.#attach) {
                    result.reattach();
                } else {
                    result.show();
                }
            } else {
                this.append(result);
            }
        } else {
            result = result();
            this.append(result);
            this.#panels.set(id, result);
        }
        this.#selectedPanel = result;
        if (this.#selectedPanel.panelOpened) {
            setTimeout(() => {
                this.#selectedPanel.panelOpened();
            }, 100);
        }
        return result;
    }

    removePanel(id) {
        let panel = this.#panels.get(id);
        if (panel instanceof UI) {
            if (panel === this.#selectedPanel) {
                this.#selectedPanel = null;
            }
            this.#panels.delete(id);
            panel.remove();
        }
    }

    reset() {
        this.#panels.forEach((value, key) => {
            if (value instanceof UI && value.reset) {
                value.reset();
            }
        });
    }

}
class WebPen extends UI {

    #canvas;

    constructor() {
        super('ui-web-pen');
        this.#canvas = new UI('canvas', this);
        this.context = this.#canvas.el.getContext('2d');
        new PresentationMover(this.#canvas.el, {
            start: this.start.bind(this),
            move: this.move.bind(this),
            done: this.done.bind(this),
        });
        this.penModels = new Map();

        const panel = new UI('div', this);
        new Icon({
            icon: 'close',
            title: I18n.get('label.close'),
            listener: this.close.bind(this),
        }, panel);
        new Icon({
            icon: 'web_asset_off',
            title: I18n.get('label.erase'),
            listener: this.erase.bind(this),
        }, panel);
    }

    close() {
        this.penModel.save(this.context);
        DomUtil.removeClass(document.body, 'pen_enabled', 'mouseover-scrollbar');
        this.detach();
    }

    open(chapter) {
        const body = document.body;
        DomUtil.addClass(body, 'pen_enabled', 'mouseover-scrollbar');
        body.append(this.el);

        const width = body.scrollWidth;
        const height = body.scrollHeight;

        this.el.style.width = `${width}px`;
        this.el.style.height = `${height}px`;
        this.context.canvas.width = width;
        this.context.canvas.height = height;

        const id = chapter ? chapter.id : '_main';
        this.penModel = this.penModels.get(id);
        if (this.penModel) {
            this.refresh();
        } else {
            this.penModel = new PresentationPenModel();
            this.penModels.set(id, this.penModel);
        }
    }

    erase() {
        this.penModel.clear();
        this.refresh();
        return false;
    }

    refresh() {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.penModel.paintAll(this.context);
    }


    start(point) {
        this.penModel.add(point);
    }

    move(point) {
        this.penModel.add(point);
        this.penModel.paint(this.context);
    }

    done() {
        this.move();
        this.penModel.done();
    }

}

class PresentationPenModel {

    add(point) {
        this.point2 = this.point1;
        this.point1 = point;
    }

    done() {
        delete this.point1;
        delete this.point2;
    }

    clear() {
        delete this.imageData;
    }

    save(context) {
        this.imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    }

    paint(context) {
        if (!this.point1 || !this.point2) {
            return;
        }

        context.beginPath();
        context.moveTo(this.point1.x, this.point1.y);
        context.lineTo(this.point2.x, this.point2.y);
        context.closePath();
        context.strokeStyle = 'rgba(255, 23, 68, 0.7)';
        context.lineWidth = 3;
        context.stroke();
    }

    paintAll(context) {
        if (this.imageData) {
            context.putImageData(this.imageData, 0, 0);
        }
    }

};

class PresentationMover {

    constructor(target, handlers) {
        this.target = target;
        if ('ontouchstart' in document.documentElement) {
            this.mode = 'touch';
            target.addEventListener('touchstart', this.start.bind(this));
        } else {
            target.addEventListener('mousedown', this.start.bind(this));
        }
        this.handlers = handlers;
    }

    start(event) {
        if (this.mode === 'touch') {
            const move = this.move.bind(this);
            const up = event => {
                this.done(event);
                document.removeEventListener('touchmove', move);
                document.removeEventListener('touchend', up);
            };
            document.addEventListener('touchmove', move);
            document.addEventListener('touchend', up);
        } else {
            const move = this.move.bind(this);
            const up = event => {
                this.done(event);
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        }
        if (this.handlers.start) {
            this.handlers.start(this.getPoint(event));
        }
    }

    move(event) {
        if (this.handlers.move) {
            this.handlers.move(this.getPoint(event));
        }
    }

    done(event) {
        if (this.handlers.done) {
            this.handlers.done();
        }
    }

    getPoint(event) {
        if (this.mode === 'touch') {
            const touches = event.changedTouches;
            if (touches.length === 0) {
                return {};
            }
            return {
                x: touches[0].clientX,
                y: touches[0].clientY
            };
        } else {
            return {
                x: event.pageX,
                y: event.pageY
            };
        }
    }

};
class BarProgress extends UI {

    #rate;

    #div;

    #span;

    #knob;

    #message;

    constructor(parent) {
        super('ui-bar-progress', parent);
        this.#div = new UI('div', this.child('div'));
        this.#span = this.child('span').addClass('select-none');
    }

    set message(message) {
        if (this.#message) {
            this.#message.remove();
            this.#message = null;
        }
        if (message) {
            this.#message = document.createTextNode(message);
            this.el.prepend(this.#message);
        }
    }

    set rate(rate) {
        this.#rate = Math.ceil(rate);
        const width = `${this.#rate}%`;
        this.#div.css({
            width,
        });
        this.#span.html(width);
        if (this.#knob) {
            this.#knob.css({
                left: `calc(${this.#rate}% - 0.25rem)`,
            });
        }
    }

    errorHappend() {
        this.addClass('error_happend');
        new Link({
            name: I18n.get('label.remove'),
            listener: () => this.remove(),
        }, this);
    }

    enable(listener) {
        let bar = this.#div;
        this.#knob = new UI('ui-knob', bar);
        this.rate = this.#rate;
        this.#knob.on('mousedown', event => {
            const { width } = bar.el.parentElement.getBoundingClientRect();
            let rate = this.#rate;
            let x = event.screenX;
            const move = event => {
                event.preventDefault();
                let x1 = event.screenX;
                rate = Math.min(100, rate + (x1 - x) * 100 / width);
                rate = Math.max(10, rate);
                this.rate = rate;
                x = x1;
            }
            const up = event => {
                event.preventDefault();
                document.body.removeEventListener('mousemove', move);
                document.body.removeEventListener('mouseup', up);
                listener(this.#rate);
            }
            document.body.addEventListener('mousemove', move);
            document.body.addEventListener('mouseup', up);
        });

    }

}

class Spinner extends UI {

    constructor(parent) {
        super('ui-spinner', parent);
        new Icon('change_circle', this).addClass('animate-spin');
    }

}
class RichEditor extends UI {

    #editor;

    #undoManager;

    #timer;

    constructor(option, parent) {
        super('ui-re', parent);
        this.#undoManager = new RichEditorUndoManager(this);

        const menus = new RichEditorMenu(this);
        const main = new UI('main', this);
        main.addClass('re_content', 'mouseover-scrollbar');
        main.attr('placeholder', option.placeholder || '');
        this.#editor = main.el;
        this.#editor.contentEditable = true;
        this.#editor.tabIndex = -1;
        this.value = option.value || '';

        this.#editor.addEventListener('click', ({ target }) => {
            menus.elementChanged(this.getCurrentElement(this.getRange()));
            if (target.tagName === 'A') {
                new RichEditorLinker(this, target);
            } if (!this.value) {
                this.value = '<p><br></p>';
            }
        });

        this.#editor.addEventListener('keydown', e => {
            const { key } = e;
            if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight'
                || key === 'Home' || key === 'End' || key === 'PageUp' || key === 'PageDown') {
                menus.elementChanged(this.getCurrentElement(this.getRange()));
            }
            const ctrl = e.ctrlKey || e.metaKey;
            if (key === '/') {
                const range = this.getRange();
                if (range.startOffset === 0 || ctrl) {
                    const currentElement = this.getCurrentElement();
                    let t = currentElement ? currentElement.tagName.toLowerCase() : null;
                    const cm = new ContextMenu();
                    [
                        { name: 'normal', type: 'p' },
                        { name: 'heading1', type: 'h1' },
                        { name: 'heading2', type: 'h2' },
                        { name: 'blockquote', type: 'blockquote' },
                        { name: 'code', type: 'pre' },
                        { name: 'ordered_list', type: 'ol' },
                        { name: 'unordered_list', type: 'ul' },
                    ].forEach(({ name, type }) => {
                        cm.add({
                            name: I18n.get(`label.${name}`),
                            checked: t === type,
                            listener: () => this.changeElementType(type, range),
                        });
                    });
                    cm.open(range.startContainer.parentElement, null, () => this.#editor.focus());
                }
            }
            if (ctrl) {
                const keyMap = {
                    '0': 'p',
                    '1': 'h1',
                    '2': 'h2',
                    '3': 'blockquote',
                    '4': 'pre',
                    '5': 'ol',
                    '6': 'ul'
                };
                if (keyMap[key]) {
                    e.preventDefault();
                    this.changeElementType(keyMap[e.key]);
                } else if (key === 'X' && e.shiftKey) {
                    e.preventDefault();
                    this.changeInline('del');
                } else if (key === 'e') {
                    e.preventDefault();
                    this.changeInline('code');
                } else if (key === 'l') {
                    e.preventDefault();
                    new RichEditorLinker(this, null);
                } else if (key === 'z') {
                    e.preventDefault();
                    this.undoManager.undo();
                } else if (key === 'y') {
                    e.preventDefault();
                    this.undoManager.redo();
                }
            } else {
                const selection = window.getSelection();
                if (!selection.rangeCount) {
                    return;
                }
                const range = this.getRange();
                const currentElement = this.getCurrentElement(range);
                if (currentElement) {
                    const { tagName } = currentElement;
                    if (key === 'Enter') {
                        // pre, blockquote에서 계속 Enter 키를 눌렀을 때 빈 p 단락 추가
                        if (currentElement.tagName === 'PRE' || currentElement.tagName === 'BLOCKQUOTE') {
                            const previous = currentElement.previousElementSibling;
                            if (previous && !previous.innerText.trim() && previous.tagName === currentElement.tagName) {
                                e.preventDefault();
                                this.addElement({
                                    name: 'p',
                                    html: '<br>',
                                });
                                return;
                            }
                        }
                    } else if (e.key === 'ArrowUp') {
                        // 맨 처음 단락의 맨 앞에서 단락 유형이 pre, blockquote, figure, ol, ul 일 때
                        // 앞에 빈 p 단락 추가
                        if (currentElement === this.#editor.firstElementChild && range.startOffset === 0) {
                            if (['PRE', 'BLOCKQUOTE', 'FIGURE', 'OL', 'UL'].includes(tagName)) {
                                e.preventDefault();
                                this.applyChange(() => this.addPToTop());
                                return;
                            }
                        }
                    } else if (key === 'Tab') {
                        if (tagName === 'PRE') {
                            e.preventDefault();
                            this.applyChange(() => this.addTabChracater(range, selection));
                            return;
                        }
                    }
                }
            }
            if (!ctrl) {
                this.#undoManager.save();
            }
        });

        this.#editor.addEventListener('paste', e => {
            this.undoManager.save();
            const clipboardData = e.clipboardData || window.clipboardData;
            if (this.pasteImage(clipboardData) || this.pasteHtml(clipboardData)) {
                e.preventDefault();
            }
        });
    }

    applyChange(run) {
        this.undoManager.save();
        run();
    }

    addPToTop() {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        this.#editor.prepend(p);
        this.moveCursor(p);
    }

    addTabChracater(range, selection) {
        const tabCharacter = "    ";
        const tabNode = document.createTextNode(tabCharacter);
        range.insertNode(tabNode);
        // 커서를 삽입된 탭 바로 뒤로 이동
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    pasteImage(clipboardData) {
        const items = clipboardData.items;
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = ev => { this.insertImage(ev.target.result); };
                reader.readAsDataURL(blob);
                return true;
            }
        }
    }

    pasteHtml(clipboardData) {
        const html = clipboardData.getData('text/html');
        if (html) {
            const handler = each => {
                const { tagName, nodeType } = each;
                if (tagName) {
                    if (nodeType === 3) {
                        this.addElement({
                            name: 'p',
                            html: each.textContent,
                            saveState: false,
                        });
                    } else if (this.isMonospace(each)) {
                        let code = '';
                        each.childNodes.forEach(sub => {
                            if (code) {
                                code += '<br>';
                            }
                            code += sub.textContent;
                        });
                        this.addElement({
                            name: 'pre',
                            html: code,
                            saveState: false,
                        });
                    } else if (tagName === 'H1' || tagName === 'H2' || tagName === 'PRE' || tagName === 'BLOCKQUOTE') {
                        this.addElement({
                            name: tagName,
                            html: each.innerText,
                            saveState: false,
                        });
                    } else if (tagName === 'P' || tagName === 'DIV' || tagName === 'FIGURE') {
                        this.addElement({
                            name: tagName,
                            html: each.innerHTML,
                            saveState: false,
                        });
                    } else if (tagName === 'OL' || tagName === 'UL') {
                        let code = '';
                        each.childNodes.forEach(sub => {
                            if (sub.tagName === 'LI') {
                                code += `<li>${sub.innerText}</li>`;
                            }
                        });
                        this.addElement({
                            name: tagName,
                            html: code,
                            saveState: false,
                        });
                    } else if (tagName === 'IMG') {
                        this.addElement({
                            name: 'figure',
                            html: `<img src="${each.src}">`,
                            saveState: false,
                        });
                    } else {
                        this.addElement({
                            name: 'p',
                            html: each.innerText,
                            saveState: false,
                        });
                    }
                }
            }
            const allowedTags = ['h1', 'h2', 'p', 'pre', 'blockquote', 'ol', 'ul',
                'b', 'del', 'a', 'img', 'figure', 'div', 'li'];
            this.applyChange(() => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                doc.body.childNodes.forEach(each => {
                    if (each.tagName && allowedTags.includes(each.tagName.toLowerCase())) {
                        handler(each);
                    }
                });
            });
            return true;
        }
    }

    isMonospace(el) {
        const style = el.getAttribute('style');
        if (style) {
            const font = style.toLowerCase();
            if (font.includes('monospace') ||
                font.includes('courier') ||
                font.includes('consolas') ||
                font.includes('fira code')) {
                return true;
            }
        }
        return false;
    }

    get undoManager() {
        return this.#undoManager
    }

    get value() {
        return this.#editor.innerHTML;
    }

    set value(value) {
        this.#editor.innerHTML = value;
    }

    changeInline(type, range) {
        range = range || this.getRange();
        if (!range) {
            return;
        }
        this.applyChange(() => {
            let inline = range.commonAncestorContainer;
            if (inline) {
                if (inline.nodeType === 3) {
                    inline = inline.parentElement;
                }
                if (inline && inline.tagName.toLowerCase() === type) {
                    [...inline.childNodes].forEach(each => {
                        inline.after(each);
                    });
                    inline.remove();
                    return;
                }
            }
            const code = document.createElement(type);
            range.surroundContents(code);
        });
    }

    moveCursor(el, isFirst) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(isFirst);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    getSelectedElements(range) {
        let start = range.startContainer;
        if (!start.closest) {
            start = start.parentNode;
        }
        start = start.closest('main > *');
        let end = range.endContainer;
        if (!end.closest) {
            end = end.parentNode;
        }
        end = end.closest('main > *');

        const result = [];
        let next = start;
        while (next) {
            result.push(next);
            if (next == end) {
                break;
            }
            next = next.nextElementSibling;
        }
        return result;
    }

    changeElementType(targetTagName, isFirst, r) {
        const currentElements = this.getSelectedElements(r || this.getRange());
        if (!currentElements || !currentElements.length) {
            return;
        }
        this.applyChange(() => {
            if (targetTagName === 'ol' || targetTagName === 'ul') {
                const list = document.createElement(targetTagName);
                currentElements[0].before(list);
                currentElements.forEach(each => {
                    const children = each.querySelectorAll('li');
                    if (children.length) {
                        children.forEach(each => list.append(each));
                    } else {
                        const li = document.createElement('li');
                        li.innerHTML = each.innerHTML;
                        list.append(li);
                    }
                    each.remove();
                });
                this.moveCursor(list, isFirst);
            } else if (targetTagName === 'blockquote' || targetTagName === 'pre') {
                const pre = document.createElement(targetTagName);
                currentElements[0].before(pre);
                currentElements.forEach(each => {
                    const children = each.querySelectorAll('li');
                    if (children.length) {
                        children.forEach(child => pre.innerHTML += child.innerHTML + '<br>');
                    } else {
                        pre.innerHTML += each.innerHTML + '<br>';
                    }
                    each.remove();
                });
                this.moveCursor(pre, isFirst);
            } else {
                let p;
                currentElements.forEach(each => {
                    const children = each.querySelectorAll('li');
                    if (children.length) {
                        children.forEach(child => {
                            p = document.createElement(targetTagName);
                            p.innerHTML += child.innerHTML;
                            each.before(p);
                        });
                    } else {
                        p = document.createElement(targetTagName);
                        p.innerHTML += each.innerHTML;
                        each.before(p);
                    }
                    each.remove();
                });
                this.moveCursor(p, isFirst);
            }
        });
    }

    getRange() {
        const selection = window.getSelection();
        if (!selection.rangeCount) {
            return;
        }
        return selection.getRangeAt(0);
    }

    getCurrentElement(range) {
        if (!range) {
            return;
        }
        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) {
            container = container.parentNode;
        }
        return container.closest('main > *');
    }

    addElement({ name, html, addBlank, saveState = true }) {
        const f = () => {
            const range = this.getRange();
            range.deleteContents();
            const element = document.createElement(name);
            element.innerHTML = html;

            const currentElement = this.getCurrentElement(range);
            if (currentElement) {
                currentElement.after(element);
                if (!currentElement.textContent) {
                    currentElement.remove();
                }
            } else {
                this.#editor.append(element);
            }
            if (addBlank) {
                const p = document.createElement('p');
                p.innerHTML = '<br>';
                element.after(p);
                this.moveCursor(p);
            } else {
                this.moveCursor(element);
            }
        }
        if (saveState) {
            this.applyChange(() => f());
        } else {
            f();
        }
    }

    addImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = () => {
            const { files } = input;
            for (let i = 0; i < files.length; i++) {
                if (!files[i].type.startsWith('image')) {
                    Messages.showAutoClose(I18n.get('label.unsupported_image'));
                    continue;
                }
                const reader = new FileReader();
                reader.readAsDataURL(files[i]);
                reader.onload = () => this.insertImage(reader.result);
            }
        };
        input.click();
    }

    insertImage(src) {
        this.applyChange(() => {
            const range = this.getRange(0);
            if (range) {
                this.addElement({
                    name: 'figure',
                    html: `<img src="${src}">`,
                    addBlank: true,
                });
            }
        });
    }

}

class RichEditorUndoManager {

    static MAX = 100;

    #editor;
    #undoStack;
    #redoStack;

    constructor(editor) {
        this.#editor = editor;
        this.#undoStack = [];
        this.#redoStack = [];
    }

    save() {
        const html = this.#editor.value;
        const length = this.#undoStack.length;
        if (length && html.startsWith(this.#undoStack[length - 1])) {
            return;
        }
        this.#undoStack.push(html);
        this.#redoStack.length = 0;
        if (this.#undoStack.length > RichEditorUndoManager.MAX) {
            this.#undoStack.shift();
        }
    }

    undo() {
        if (this.#undoStack.length === 0) {
            return;
        }

        this.#redoStack.push(this.#editor.value);
        this.#editor.value = this.#undoStack.pop();
    }

    redo() {
        if (this.#redoStack.length === 0) {
            return;
        }
        this.#undoStack.push(this.#editor.value);
        this.#editor.value = this.#redoStack.pop();
    }

}

class RichEditorMenu extends UI {

    #menus = new Map();

    #elementType;

    constructor(editor) {
        super('header', editor);
        this.#elementType = new Link({
            name: I18n.get('label.paragraph_type'),
            listener: (e, link) => {
                const selection = window.getSelection();
                if (!selection.rangeCount) {
                    return;
                }
                const range = selection.getRangeAt(0);
                let t = 'normal';
                const cm = new ContextMenu();
                [{ name: 'normal', type: 'p' },
                { name: 'heading1', type: 'h1' },
                { name: 'heading2', type: 'h2' },
                { name: 'blockquote', type: 'blockquote' },
                { name: 'code', type: 'pre' },
                { name: 'ordered_list', type: 'ol' },
                { name: 'unordered_list', type: 'ul' },].forEach(({ name, type }) => {
                    cm.add({
                        name: I18n.get(`label.${name}`),
                        checked: t === type,
                        listener: () => editor.changeElementType(type, true, range),
                    });
                });
                cm.open(link);
            },
        }, this);
        [
            {
                type: 'b',
                name: 'emphasis',
                icon: 'format_bold',
            },
            {
                type: 'del',
                name: 'delete',
                icon: 'format_strikethrough',
            },
            {
                type: 'code',
                icon: 'code',
            },
            {
                type: 'link',
                icon: 'link',
            },
            {
                type: 'image',
                icon: 'image',
            },
        ].forEach(({ type, name, icon }) => {
            let menu = new Icon({
                icon,
                listener: () => this.run(editor, type),
            }, this);
            this.#menus.set(type, menu);
            menu.el.tabIndex = -1;
            if (!name) {
                name = type;
            }
            let help = type;
            if (type === 'image') {
                help = 'img';
            } else if (type === 'code') {
                help = 'inline_code';
            }
            menu.attr('title', `${I18n.get(`label.${name}`)}/${I18n.get(`label.re_help_${help}`)}`);
        });
    }

    elementChanged(element) {
        if (element) {
            let name;
            switch (element.tagName) {
                case 'H1': {
                    name = 'heading1';
                    break;
                }
                case 'H2': {
                    name = 'heading2';
                    break;
                }
                case 'BLOCKQUOTE': {
                    name = 'blockquote';
                    break;
                }
                case 'PRE': {
                    name = 'code';
                    break;
                }
                case 'OL': {
                    name = 'ordered_list';
                    break;
                }
                case 'UL': {
                    name = 'unordered_list';
                    break;
                }
                default: {
                    name = 'normal';
                }
            }
            this.#elementType.name = I18n.get(`label.${name}`);
        }
    }

    run(editor, type) {
        if (type === 'link') {
            const range = editor.getRange();
            if (range) {
                new RichEditorLinker(editor, null);
            }
        } else if (type === 'image') {
            this.parent.addImage();
        } else {
            const range = editor.getRange();
            this.parent.changeInline(type, range);
        }
    }

}

class RichEditorLinker extends Modal {

    constructor(editor, link) {
        super({
            title: I18n.get('label.link'),
        });
        const range = editor.getRange();
        const form = new Form();
        const fields = this.addComponent(new Fields({ form }));
        fields.name();
        fields.text({
            name: 'link',
            required: true,
        });
        fields.bool({
            name: 'openLinkInNewWindow',
        });
        if (link) {
            form.parameter = {
                name: link.innerText,
                link: link.href,
                openLinkInNewWindow: link.target === '_blank',
            };
            this.button({
                name: I18n.get('label.save'),
                listener: () => {
                    const parameter = form.parameter;
                    if (parameter) {
                        editor.undoManager.save();
                        link.innerText = parameter.name;
                        link.href = parameter.link;
                        if (parameter.openLinkInNewWindow) {
                            link.target = '_blank';
                        } else {
                            link.target = '';
                        }
                        this.close();
                    }
                },
            });
            this.button({
                name: I18n.get('label.remove'),
                listener: () => {
                    editor.undoManager.save();
                    const textNode = document.createTextNode(link.innerText);
                    link.after(textNode);
                    link.remove();
                    this.close();
                },
            });
        } else {
            const name = range.toString();
            form.parameter = {
                name,
            };
            this.button({
                name: I18n.get('label.save'),
                listener: () => {
                    const parameter = form.parameter;
                    if (parameter) {
                        editor.undoManager.save();
                        const a = new UI('a').attr('href', parameter.link);
                        if (parameter.openLinkInNewWindow) {
                            a.attr('target', '_blank');
                        }
                        if (name) {
                            range.surroundContents(a.el);
                        } else {
                            a.plain(parameter.name);
                            range.insertNode(a.el);
                        }
                        this.close();
                    }
                },
            });
            this.button({
                name: I18n.get('label.cancel'),
                listener: () => {
                    this.close();
                    range.collapse();
                },
            });
        }
    }

}
class SearchBox extends UI {

    #option;

    #input;

    #typeFilter;

    #keywordSuggestion;

    constructor(option, parent) {
        super('ui-search-box', parent);
        const div = this.child('div');
        this.#option = option;
        if (this.#option.typeFilter) {
            this.#typeFilter = new SearchTypeFilter(this.#option.typeFilter, this);
        }
        if (this.#option.filter) {
            const filterIcon = new Icon({
                icon: 'filter_list',
                listener: () => new SearchFilter(filterIcon, this.#option.filter),
            }, div).addClass('filter');
        }
        this.#input = div.append('input', input => {
            input.addEventListener('keyup', event => {
                if (event.key === 'Enter' || option.keyup) {
                    this.search();
                    if (suggester) {
                        suggester.hide();
                    }
                } else if (suggester) {
                    suggester.update(event.target.value, event.key);
                }
            });
            input.placeholder = option.placeholder || I18n.get('label.search');
        });
        const suggester = option.suggestion ? new SearchSuggester(this, option.suggestion, this.#input) : null;
        if (option.value) {
            this.#input.value = option.value;
        }
        div.append(new Icon({
            icon: 'clear',
            listener: () => {
                this.#input.value = '';
                if (this.#typeFilter) {
                    this.#typeFilter.resetValue();
                }
                this.search();
            },
        }).addClass('clear'));
        div.append(new Icon({
            icon: 'search',
            listener: event => this.search(),
        }));
        if (option.keywordSuggestion) {
            this.#keywordSuggestion = new KeywordSuggestion(option.keywordSuggestion, this);
        }
    }

    getQuery() {
        const query = {
            query: this.#input.value,
        };
        if (this.#option.filter) {
            query.filter = {};
            this.#option.filter.forEach(each => {
                const values = [];
                each.options.forEach(option => {
                    if (option.checked) {
                        values.push(option.value);
                    }
                })
                if (values.length > 0) {
                    query.filter[each.id] = values;
                }
            });
        }
        if (this.#typeFilter) {
            const type = this.#typeFilter.value;
            if (type) {
                query.type = type;
            }
        }
        return query;
    }

    search(q) {
        if (q) {
            this.#input.value = q;
        }
        const query = this.getQuery();
        this.#option.listener(query);
        if (!q && this.#keywordSuggestion) {
            this.#keywordSuggestion.run(query.query);
        }
    }

    focus() {
        setTimeout(() => {
            this.#input.focus();
        }, 10);
    }

    queryString(name) {
        return new QueryString().get(name);
    }

}

class SearchTypeFilter extends UI {

    #value;

    #valueHolder;

    constructor({ value, values }, searchBox) {
        super('ui-type-filter', searchBox.query('div'));
        this.#valueHolder = new UI('span', this);
        new Icon('keyboard_arrow_down', this);
        if (value) {
            let v;
            for (let each of values) {
                if (each.value === value || each === value) {
                    v = each;
                    break;
                } else if (each.values) {
                    for (let subEach of each.values) {
                        if (subEach.value === value) {
                            v = subEach;
                            break;
                        }
                    }
                }
            }
            if (v) {
                this.#value = v;
                this.#valueHolder.html(v.name || v);
            }
        }
        this.on('click', event => {
            if (values.length && values[0].values) {
                const v = this.#value && (this.#value.value || this.#value);
                const fp = new FloatingPanel().addClass('flex', 'gap-16', 'p-6');
                values.forEach(group => {
                    if (group.values.length) {
                        const d = new UI('div', fp).addClass('flex', 'flex-col', 'gap-4');
                        new UI('h1', d).plain(group.name).addClass('text-zinc-600');
                        const section = new UI('section', d).addClass('flex', 'flex-col', 'gap-1');
                        group.values.forEach(item => {
                            new UIArray([
                                () => {
                                    if (v === item.value) {
                                        return new Label({ name: item.name });
                                    } else {
                                        return new Plain(item.name);
                                    }
                                },
                            ], section).addClass('cursor-pointer').on('click', () => {
                                if (v === item.value) {
                                    this.#value = null;
                                    this.#valueHolder.clear();
                                } else {
                                    this.#value = item;
                                    this.#valueHolder.html(item.name);
                                }
                                searchBox.search();
                                fp.close();
                            });
                        });
                    }
                });
                fp.open(this.el);
            } else {
                const contextMenu = new ContextMenu();
                values.forEach(each => {
                    let name = each.name || each;
                    let value = each.value || each;
                    contextMenu.add({
                        name,
                        checked: value === this.value,
                        listener: item => {
                            if (item.checked()) {
                                this.#value = null;
                                this.#valueHolder.clear();
                            } else {
                                this.#value = value;
                                this.#valueHolder.html(name);
                            }
                            searchBox.search();
                        },
                    });
                });
                const { x, y, height } = this.el.getBoundingClientRect();
                contextMenu.open(x, y + height);
            }
        });
    }

    get value() {
        return this.#value && (this.#value.value || this.#value);
    }

    resetValue() {
        this.#value = null;
        this.#valueHolder.clear();
    }

}

class SearchFilter {

    constructor(filterIcon, options) {
        const floatingPanel = new FloatingPanel().open(filterIcon);
        const form = new Form();
        const fields = new Fields({ form: form }, floatingPanel);
        fields.addClass('p-4');
        const parameter = {};
        options.forEach(({ id, name, options, layout }) => {
            fields.checkboxGroup({
                name: id,
                label: name,
                values: options,
                layout,
                input: v => {
                    const option = options.find(each => v === each.value);
                    option.checked = !option.checked;
                },
            }).addClass('flex-col');
            parameter[id] = options.filter(each => each.checked).map(each => each.value);
        });
        form.parameter = parameter;
    }

}

class KeywordSuggestion extends UI {

    #id;

    #searhForm;

    constructor(id, searhForm) {
        super('ui-keyword-suggestion', searhForm);
        this.#id = id;
        this.#searhForm = searhForm;
        this.hide();
    }

    async run(query) {
        const response = await Http.get(`/r/viewer/keyword_suggestion/${this.#id}?query=${query}`);
        if (response.length) {
            this.clear();
            this.html(I18n.get('label.keyword_suggestion'));
            response.forEach(each => {
                new Link({
                    name: each,
                    listener: event => {
                        event.preventDefault();
                        this.#searhForm.search(each);
                    }
                }, this);
            });
            this.show();
        } else {
            this.hide();
        }
    }

}

class QueryString {

    #map = new Map();

    constructor() {
        const q = window.location.search;
        if (!q) {
            return;
        }
        decodeURIComponent(q).substring(1).split('&').forEach(each => {
            const k = each.split('=');
            if (k.length === 2) {
                this.#map.set(k[0], k[1]);
            }
        });
    }

    get(name) {
        return this.#map.get(name);
    }

}

class SearchSuggester extends UI {

    #searchBox;

    #id;

    #input;

    #values;

    #index;

    #items = [];

    #loaded = false;

    constructor(searchBox, id, input) {
        super('ui-search-suggester', document.body);
        this.addClass('mouseover-scrollbar');
        this.#searchBox = searchBox;
        this.#id = id;
        this.#input = input;
        this.hide();
        document.body.addEventListener('click', event => {
            if (!event.target.closest('ui-search-box, ui-search-suggester')) {
                this.hide();
            }
        });
    }

    async update(keyword, key) {
        if (key === 'ArrowUp') {
            if (this.#items.length > 1) {
                this.#items[this.#index].blur();
                this.#index--;
                if (this.#index < 0) {
                    this.#index = this.#items.length - 1;
                }
                this.#items[this.#index].focus();
            }
            return;
        }
        if (key === 'ArrowDown') {
            if (this.#items.length > 1) {
                this.#items[this.#index].blur();
                this.#index++;
                if (this.#index > (this.#items.length - 1)) {
                    this.#index = 0;
                }
                this.#items[this.#index].focus();
            }
            return;
        }

        if (!this.#loaded) {
            this.#loaded = true;
            this.#values = (await Http.get(`/r/find/suggest/${this.#id}`)).map(each => ({ k: each.toLowerCase(), v: each }));
            this.#input.addEventListener('focus', () => this.show());
        } else if (!this.#values || !this.#values.length) {
            this.hide();
            return;
        }
        const { x, y, height, width } = this.#searchBox.el.getBoundingClientRect();
        this.css({
            display: 'flex',
            top: `${y + height - 2}px`,
            left: `${x}px`,
            maxHeight: `calc(100dvh - ${y + height * 4}px)`,
            width: `${width}px`,
        });
        this.clear();
        this.#items.length = 0;
        if (keyword) {
            const highlighter = this.createHighlighter(keyword);
            this.#index = 0;
            this.#items.push(new SearchSuggesterItem({
                value: keyword,
                input: this.#input,
                highlighter,
            }, this).addClass('selected'));
            const lowerKeyword = keyword.toLowerCase();
            this.#values.forEach(each => {
                const { k, v } = each;
                if (k !== lowerKeyword) {
                    if (k.startsWith(lowerKeyword)) {
                        this.#items.push(new SearchSuggesterItem({
                            value: v,
                            input: this.#input,
                            highlighter,
                        }, this));
                    } else if (lowerKeyword.length > 1 && k.includes(lowerKeyword)) {
                        this.#items.push(new SearchSuggesterItem({
                            value: v,
                            input: this.#input,
                            highlighter,
                        }, this));
                    }
                }
            });
        } else {
            this.hide();
        }
    }

    createHighlighter(keyword) {
        if (!keyword) return text => text;
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedKeyword, 'gi');
        return function (text) {
            return text.replace(regex, match => `<b>${match}</b>`);
        };
    }

}

class SearchSuggesterItem extends UI {

    #input;

    #value;

    constructor({ value, input, highlighter }, parent) {
        super('p', parent);
        this.#value = value;
        this.#input = input;
        this.html(highlighter(value));
        this.on('click', () => this.setValue());
    }

    setValue() {
        this.#input.value = WebUtils.stripTags(this.#value);
        this.#input.focus();
    }

    focus() {
        this.addClass('selected');
        this.setValue();
        this.el.scrollIntoView({ block: "start", inline: "nearest", behavior: 'smooth', });
    }

    blur() {
        this.removeClass('selected');
    }

}
class CategorySelector extends UI {

    #listener;

    #selected;

    constructor(listener, parent) {
        super('ui-category-selector', parent);
        this.#listener = listener;
    }

    set(categories) {
        categories.forEach(each => {
            this.add(each);
        });
    }

    add(model) {
        const span = new UI('span', this);
        span.html(model.name);
        model.ui = span;
        span.on('click', () => {
            if (this.#selected) {
                delete this.#selected.el.dataset.selected;
                if (this.#selected === span) {
                    this.#selected = null;
                    this.#listener(model, false);
                    return;
                }
            }
            span.el.dataset.selected = 'true';
            this.#selected = span;
            if (this.#listener) {
                this.#listener(model, true);
            }
        });
        return span;
    }

}
class Sharing extends Panel {

    constructor(parent) {
        super(I18n.get('label.share_this'), parent);
        new UIArray([
            this.link(),
            this.x(),
            this.facebook(),
            () => {
                if (Applications.getOption().enableMailSharing) {
                    return this.mail();
                }
            },
        ], this).addClass('gap-4');
    }

    link() {
        const result = new UI('span').addClass('share_by_link').attr('title', I18n.get('label.link'));
        new Icon('link', result);
        result.on('click', () => {
            new WebClipboard().copy(window.location.href);
        });
        return result;
    }

    x() {
        const result = new UI('span').addClass('share_by_x').attr('title', I18n.get('label.x_com'));
        result.on('click', () => {
            let url = 'https://x.com/intent/tweet';
            url += '?text=' + encodeURIComponent(document.title);
            url += '&url=' + encodeURIComponent(window.location.href);
            window.open(url, '', 'width=600, height=450');
        });
        new UI('span', result);
        return result;
    }

    facebook() {
        const result = new UI('span').addClass('share_by_facebook').attr('title', I18n.get('label.facebook'));
        result.on('click', () => {
            let url = 'https://www.facebook.com/sharer/sharer.php';
            url += '?u=' + encodeURIComponent(window.location.href);
            url += '&t=' + encodeURIComponent(document.title);
            window.open(url, '', 'width=600, height=450');
        });
        new UI('span', result);
        return result;
    }

    mail() {
        const { title, enableMailSharing } = Applications.getOption();
        const result = new UI('span').addClass('share_by_mail').attr('title', I18n.get('label.mail'));
        result.on('click', () => {
            const modal = new Modal({
                title: `${I18n.get('label.share_this')}(${I18n.get('label.mail')})`,
            });
            const form = new Form();
            let fields = modal.addComponent(new Fields({ form, })).css({
                width: '40rem',
                maxWidth: '100%',
            });
            const to = fields.text({
                name: 'to',
                label: I18n.get('label.to_address'),
                required: true,
            });
            fields.text({
                name: 'subject',
                label: I18n.get('label.sebject_of_mail'),
                required: true,
            });
            fields.textarea({
                name: 'body',
                required: true,
                size: 'large',
            });
            form.parameter = {
                to: sessionStorage.getItem('mailShareToAddress') || '',
                subject: `${I18n.get('label.share_this')}: ${title} / ${document.title}`,
                body: window.location.href + '\n\n',
            };
            modal.button({
                name: I18n.get('label.send'),
                listener: async () => {
                    const parameter = form.parameter;
                    if (parameter) {
                        if (!WebUtils.validateEmail(parameter.to)) {
                            Messages.showAutoClose(I18n.get('message.invalid_email_address'));
                            to.focus();
                            return;
                        } else {
                            sessionStorage.setItem('mailShareToAddress', parameter.to);
                        }
                        const { content, error } = await Http.post('/r/viewer/share_by_email', parameter);
                        if (content) {
                            Messages.showAutoClose(content);
                            modal.close();
                        } else if (error) {
                            Messages.showAutoClose(error);
                        }
                    }
                },
            });
        });
        new UI('span', result);
        return result;
    }

}
class ShortcutKeysLimiter {

    constructor({ moduleType, layoutOption }) {
        window.addEventListener('keydown', event => {
            const { key, ctrlKey, metaKey, shiftKey } = event;
            if ((key === 'I' || key === 'J') && (ctrlKey || metaKey) && shiftKey) {
                event.preventDefault();
                Messages.showAutoClose(I18n.get('label.shortcut_keys_not_available', `Ctrl + Shift + ${key}`));
            } else if (ctrlKey || metaKey) {
                if (key === 'a' || key === 'c' || key === 'p' || key === 's' || key === 'u' || key === 'x') {
                    event.preventDefault();
                    Messages.showAutoClose(I18n.get('label.shortcut_keys_not_available', `Ctrl + ${key.toUpperCase()}`));
                }
            } else if (key === 'F12') {
                event.preventDefault();
                Messages.showAutoClose(I18n.get('label.shortcut_keys_not_available', key));
            }
        });
        if (moduleType !== 'WV' || !layoutOption.disableContentCopy) {
            disableContentCopy();
        }
        DomUtil.addClass(document.body, 'no-print');
    }

}

const disableContentCopy = () => {
    DomUtil.addClass(document.body, 'select-none');
    window.oncontextmenu = event => {
        event.preventDefault();
        Messages.showAutoClose(I18n.get('label.context_menu_not_available'));
        return false;
    };
}
class SidebarManager {

    #buttons;

    constructor(parent) {
        this.components = new Map();
        this.#buttons = new SidebarButtons(parent).addClass('hidden');
        this.sidebar = new Sidebar(parent);
    }

    clearButtons() {
        this.#buttons.clearButtons();
    }

    add(button) {
        this.#buttons.removeClass('hidden');
        return this.#buttons.add(button);
    }

    runButton(i) {
        this.#buttons.runButton(i);
    }

    getCurrentButtonIndex() {
        return this.#buttons.getCurrentButtonIndex(this.selected);
    }

    toggle(button) {
        let result;
        if (this.selected === button) {
            if (!DomUtil.hasClass(document.body, 'mobile_sidebar_opened')) {
                result = button.toggle();
            }
        } else {
            if (this.selected) {
                this.selected.deselected();
            }
            this.selected = button;
            result = button.toggle();
        }
        if (!result) {
            this.sidebar.hide();
        }
        const { moduleType } = Applications.getOption();
        if (moduleType) {
            const key = `sidarbar_opened_${moduleType}`;
            if (button.selected) {
                localStorage.setItem(key, this.#buttons.getCurrentButtonIndex(button));
            } else {
                localStorage.removeItem(key);
            }
        }
        return result;
    }

    show(button, builder) {
        let component = this.components.get(button.uuid);
        if (!component) {
            component = builder();
            this.components.set(button.uuid, component);
        }
        this.sidebar.show(component);
    }

}

class SidebarButtons extends UI {

    #buttons = new Array();

    constructor(parent) {
        super('ui-sidebar-buttons', parent);
        this.tops = document.createElement('div');
        const { logo, logoHref, moduleType, fillLogoBackground, } = Applications.getOption();
        if (logo && moduleType !== 'FRAGMENT') {
            const ui = new UI('ui-logo', this.tops).css({
                backgroundImage: `url(${logo})`,
            });
            if (fillLogoBackground) {
                ui.css({
                    backgroundColor: `var(--color-400)`,
                });
            }
            if (logoHref) {
                ui.addClass('cursor-pointer').on('click', () => window.location.href = logoHref);
            }
        }
        this.append(this.tops);
        this.bottoms = document.createElement('div');
        this.append(this.bottoms);
    }

    clearButtons() {
        this.#buttons.forEach(each => each.remove());
        this.#buttons.length = 0;
    }

    add(model) {
        const result = new SidebarButton(model, model.bottom ? this.bottoms : this.tops);
        this.#buttons.push(result);
        return result;
    }

    runButton(i) {
        this.#buttons[i].run();
    }

    getCurrentButtonIndex(selected) {
        for (let i = 0; i < this.#buttons.length; i++) {
            if (selected === this.#buttons[i]) {
                return i;
            }
        }
        return -1;
    }

}

class SidebarButton extends UI {

    #listener;

    constructor(model, parent) {
        super('ui-icon', parent);
        this.html(model.icon);
        if (model.title) {
            this.el.title = model.title;
        }
        if (model.listener) {
            this.#listener = model.listener;
            this.on('click', () => {
                this.run();
            });
        }
    }

    set count(count) {
        if (count === 0) {
            delete this.el.dataset.count;
        } else {
            this.el.dataset.count = count > 99 ? '99+' : count;
        }
    }

    run() {
        if (this.#listener) {
            this.#listener(this);
        }
    }

    toggle() {
        this.selected = !this.selected;
        if (this.selected) {
            this.el.dataset.selected = 'true';
        } else {
            delete this.el.dataset.selected;
        }
        return this.selected;
    }

    deselected() {
        this.selected = false;
        delete this.el.dataset.selected;
    }

}

class Sidebar extends UI {

    #moduleType = Applications.getOption().moduleType;

    #component;

    constructor(parent) {
        super('ui-sidebar', parent);
        this.div = this.append('div');
        DomUtil.addClass(this.div, 'mouseover-scrollbar');
        this.enableResizer();
        this.css({
            borderRightWidth: '0px',
            display: 'none',
            width: '0px',
        });
    }

    enableResizer() {
        const resizer = this.append('ui-sidebar-resizer');
        resizer.addEventListener('mousedown', event => {
            event.preventDefault();
            DomUtil.addClass(resizer, 'enabled');
            let w = this.el.clientWidth;
            let { x } = event;
            const move = e => {
                let x1 = e.x;
                let dx = (x - x1);
                w = w - dx;
                this.el.style.width = `${w}px`;
                x = x1;
            };
            const done = e => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', done);
                document.body.style.cursor = 'default';
                DomUtil.removeClass(resizer, 'enabled');
                if (this.#moduleType) {
                    window.localStorage.setItem(`sidebar_width_${this.#moduleType}`, w);
                }
            };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', done);
            document.body.style.cursor = 'col-resize';
        });
    }

    show(component) {
        this.#component = component;
        if (!this.width) {
            if (this.#moduleType) {
                this.width = Number(window.localStorage.getItem(`sidebar_width_${this.#moduleType}`));
            }
        }

        let width;
        this.el.style.borderRightWidth = '1px';
        if (this.width) {
            width = `${this.width}px`;
        } else if (!this.el.clientWidth) {
            width = '20rem';
        }
        this.css({
            borderRightWidth: '1px',
            display: 'block',
            width,
        });
        this.div.style.padding = '1rem';
        const before = this.div.firstChild;
        if (before) {
            this.div.removeChild(before);
        }
        this.div.append(component.el);
        if (this.#component.sidebarOpened) {
            this.#component.sidebarOpened();
        }
        if (this.#moduleType) {
            window.localStorage.removeItem(`sidebar_closed_${this.#moduleType}`);
        }
    }

    hide() {
        if (DomUtil.hasClass(document.body, 'mobile_sidebar_opened')) {
            return;
        }
        this.width = this.el.clientWidth;
        this.css({
            borderRightWidth: '0px',
            display: 'none',
            width: '0px',
        });
        this.div.style.padding = '0px';
        if (this.#component && this.#component.sidebarClosed) {
            this.#component.sidebarClosed();
        }
        if (this.#moduleType) {
            window.localStorage.setItem(`sidebar_closed_${this.#moduleType}`, true);
        }
    }

}
class Signout {

  #type;

  constructor(type = '') {
    this.#type = type;
  }

  async handle(handler) {
    window.signoutHandled = true;
    const parameter = await Http.get(`/r/signon/parameter/${this.#type}`);
    const modal = new Modal({
      title: I18n.get('label.login'),
    });
    modal.addComponent(new LoginModule(parameter, () => {
      delete window.signoutHandled;
      if (handler) {
        handler();
      }
      modal.close();
    }));
  }

};
class StepPanel extends UI {

    #previous;

    #next;

    #main;

    #steps = new Array();

    #current;

    constructor(parent) {
        super('ui-step-panel', parent);
        this.addClass('flex', 'items-center', 'gap-4');
        this.#previous = new Icon({
            icon: 'keyboard_arrow_left',
            listener: () => this.previous(),
        }, this).addClass('invisible', 'size-8', 'text-5xl', 'cursor-pointer', 'hover:font-bold');
        this.#main = new UI('main', this).addClass('flex-1');
        this.#next = new Icon({
            icon: 'keyboard_arrow_right',
            listener: () => this.next(),
        }, this).addClass('invisible', 'size-8', 'text-5xl', 'cursor-pointer', 'hover:font-bold');
    }

    add(step) {
        if (!(step instanceof Step)) {
            throw new Error('Step required');
        }

        if (this.#steps.length === 0) {
            this.#current = step;
            this.#main.append(step);
        }
        step.panel = this;
        this.#steps.push(step);
    }

    get(i) {
        return this.#steps[i];
    }

    set(i) {
        if (this.#current) {
            this.#current.remove();
        }
        this.#current = this.#steps[i];
        this.#current.init();
        this.#main.append(this.#current);
        if (i === 0) {
            this.#previous.addClass('invisible');
        } else {
            this.#previous.removeClass('invisible');
        }

        if (i === this.#steps.length - 1 || !this.#current.configured()) {
            this.#next.addClass('invisible');
        } else {
            this.#next.removeClass('invisible');
        }
    }

    previous() {
        const i = this.#steps.indexOf(this.#current);
        this.set(i - 1);
    }

    next() {
        const i = this.#steps.indexOf(this.#current);
        this.set(i + 1);
    }

}

class Step extends UI {

    #panel;

    #footer;

    #configured;

    constructor(model) {
        super('ui-step', model);
        this.addClass('flex', 'flex-col', 'gap-8');
        if (model.title) {
            const h1 = new UI('h1', this).html(model.title);
            h1.addClass('box-border', 'mb-10', 'pb-2', 'border_b');
            h1.css({
                color: 'var(--blue)',
            });
        }
    }

    set panel(panel) {
        this.#panel = panel;
    }

    configured() {
        return this.#configured;
    }

    addButton(model) {
        if (!this.#footer) {
            this.#footer = new UI('footer', this).addClass('flex', 'flex-row-reverse', 'gap-4', 'mt-10');
        }
        return new Button(model, this.#footer);
    }

    getStep(i) {
        return this.#panel.get(i);
    }

    init() {
    }

    next() {
        this.#configured = true;
        this.#panel.next();
    }

}
class Svg extends UI {

    constructor({ height, width, }, parent) {
        super('div', parent);
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('height', height);
        svg.setAttribute('width', width);
        this.append(svg);
    }

}
class Swimlane extends UI {

    #panels = [];

    constructor(parent) {
        super('ui-swimlane', parent);
    }

    get size() {
        return this.#panels.length;
    }

    add({ title, panel, showCount, }) {
        const section = new UI('section', this);
        const h1 = new UI('h1', section);
        if (typeof title === 'string') {
            h1.plain(title);
        } else if (title instanceof UI) {
            h1.append(title);
        } else if (Array.isArray(title)) {
            title.forEach(each => h1.append(each));
        }
        if (panel) {
            section.append(panel);
            this.#panels.push(panel);
            if (showCount) {
                const counter = new Badge('');
                h1.el.firstChild.after(counter.el);
                const observer = new MutationObserver((mutationsList, observer) => {
                    counter.name = [...panel.queryAll('ui-list-item')].filter(each => !DomUtil.hasClass(each, 'group')).length;
                });
                observer.observe(panel.el, {
                    childList: true,
                    subtree: true,
                });
            }
            return panel;
        }
    }

    loadGroups(t, values = []) {
        const panel = this.get(0);
        values.forEach(each => panel.add(new t(each, this)));
    }

    loadPools(t, values = []) {
        const panel = this.get(2);
        values.forEach(each => {
            const item = new t(each, this);
            panel.add(item);
            if (each.children) {
                each.children.forEach(innerEach => {
                    const child = new t(innerEach, this);
                    panel.configure(child);
                    item.append(child);
                });
            }
        });
    }

    addPool(t, value) {
        const panel = this.get(2);
        panel.add(new t(value, this));
    }

    loadAllocations(t, values = []) {
        const allocationPanel = this.get(1);
        allocationPanel.clear();

        const poolPanel = this.get(2);
        if (poolPanel.all) {
            poolPanel.all().forEach(each => each.enable());
        }
        values.forEach(each => {
            const item = new t(each, this);
            allocationPanel.add(item);
            if (poolPanel.all) {
                this.disablePoolItem(each.id);
            }
            if (each.children) {
                each.children.forEach(innerEach => item.append(new t(innerEach, this)));
            }
        });
    }

    addAllocation(t, item) {
        this.get(1).add(new t(item, this));
    }

    get groupId() {
        const groupPanel = this.get(0);
        if (!groupPanel.selected()) {
            return null;
        }
        const selected = groupPanel.getSelected();
        return selected.el.isConnected ? selected.id : null
    }

    get(i) {
        return this.#panels[i];
    }

    enablePoolItem(id) {
        const item = this.get(2).get(id);
        if (item) {
            item.enable();
        }
    }

    disablePoolItem(id) {
        const item = this.get(2).get(id);
        if (item) {
            item.disable();
        }
    }

}
class Tab extends UI {

    #items;

    #header;

    #switchPanel;

    #selected;

    #model;

    constructor(model, parent) {
        super('ui-tab', parent);
        this.#model = model;
        this.clear();
    }

    get index() {
        return this.#items.indexOf(this.#selected);
    }

    get count() {
        return this.#items.length;
    }

    get selectedPanel() {
        return this.#switchPanel.selected;
    }

    clear() {
        super.clear();
        this.#items = [];
        this.#header = this.child('header').addClass('mobile-scroll');
        this.#switchPanel = new SwitchPanel(this.#model, this);
        if (this.#model && this.#model.scrolled) {
            this.#switchPanel.addClass('mouseover-scrollbar');
            const css = () => {
                this.#switchPanel.css({
                    maxHeight: `calc(100dvh - ${this.#switchPanel.el.getBoundingClientRect().y + 16}px)`,
                });
            };
            new ResizeObserver(() => {
                css();
            }).observe(this.#switchPanel.el);
        }
        this.#selected = null;
    }

    add(name, loader) {
        const item = this.#header.child('span');
        if (typeof name === 'string') {
            item.html(name);
        } else {
            item.append(name);
        }
        this.#items.push(item);
        this.#switchPanel.add(item.uuid, loader);
        item.on('click', () => {
            this.selectItem(item);
        });
        return item;
    }

    selectItem(item) {
        if (this.#selected === item) {
            return;
        }
        if (this.#selected) {
            delete this.#selected.el.dataset.selected;
        }
        this.#selected = item;
        this.#selected.el.dataset.selected = 'true';
        this.#switchPanel.get(item.uuid);
    }

    select(i) {
        this.selectItem(this.#items[i]);
    }

    closeItem(item) {
        const i = this.#items.indexOf(item);
        if (i !== -1) {
            this.#items.splice(i, 1);
        }
        this.#switchPanel.removePanel(item.uuid);
        item.remove();
        return i;
    }

    reset() {
        this.#switchPanel.reset();
    }

}
class TableOfContents extends UI {

    #listener;

    #openInNew;

    #exportType;

    constructor({ id, chapters, listener, exportType = 'EDIT', openInNew = true }, parent) {
        super('ui-table-of-contents', parent);
        this.#listener = listener;
        this.#openInNew = openInNew;
        this.#exportType = exportType;
        if (id) {
            this.loadChapters(id);
        } else if (chapters) {
            this.createChapters(this.child('ul'), chapters);
        }
    }

    async loadChapters(id) {
        this.createChapters(this.child('ul'), await Http.get(`/r/book/get_chapters/${id}`, true));
    }

    createChapters(ul, chapters) {
        chapters.forEach(each => {
            if (this.#exportType !== 'EDIT') {
                const { type } = each;
                if (type === 'TITLE' || type === 'TOC' || type === 'LIST_OF_FIGURES' || type === 'LIST_OF_TABLES' || type === 'LIST_OF_CODES' || type === 'INDEX') {
                    return;
                }
            }
            ul.child('li', li => {
                if (each.excludeFromNumbering) {
                    li.addClass('exclude_from_numbering');
                }
                li.attr('data-type', each.type);
                if (each.renumbered) {
                    li.addClass('renumbered');
                }
                new Link({
                    name: new Html(each.title),
                    listener: event => {
                        event.preventDefault();
                        this.#listener(each, false, event);
                    },
                }, li);
                if (this.#openInNew) {
                    new Icon({
                        icon: 'open_in_new',
                        title: I18n.get('label.open_link_in_new_window'),
                        listener: event => {
                            event.preventDefault();
                            this.#listener(each, true, event);
                        },
                    }, li);
                }
                if (each.chapters) {
                    this.createChapters(li.child('ul'), each.chapters);
                }
            });
        });
    }

}
class TailwindcssEditor {

    #style;

    async open(option, listener) {
        const button = new Button({
            name: I18n.get('label.save'),
            disabled: true,
            listener: async () => {
                await listener({ html: editor.code });
                setTimeout(() => button.disable(), 10);
            },
        }).addClass('h-6');

        const modal = new Modal({
            title: button,
            fullscreen: true,
            closable: () => {
                return button.el.disabled || I18n.confirm('label.confirm_close_without_save');
            }
        });

        const main = modal.main;
        main.addClass('h-full');

        const layout = new GridLayout({
            gridTemplateColumns: '27rem calc(100% - 29rem)',
            gridTemplateRows: `calc(50% - 2rem) calc(50% - 2rem)`,
        }, main).addClass('h-full');

        new TailwindPalette(layout).addClass('mouseover-scrollbar', 'w-full', 'row-span-2');
        const previewer = new UI('div');
        option.preview = async (html) => {
            this.preview(previewer, html);
            button.enable();
        };
        const editor = new HtmlEditor(layout);
        await editor.open(option);
        layout.append(previewer);
        this.preview(previewer, editor.code);
    }

    async preview(previewer, html) {
        const { css } = await Http.post(`/r/tailwindcss/get_css`, { html });
        if (!this.#style) {
            this.#style = document.getElementById('tailwindcss');
            if (!this.#style) {
                this.#style = document.createElement('style');
                document.head.appendChild(this.#style);
            }
        }
        this.#style.textContent = css;
        previewer.html(html);
    }

}

class TailwindPalette extends Page {

    constructor(parent) {
        super({}, parent);
        new PageHeader({
            icon: 'css',
            title: 'Tailwindcss',
            subtitle: new Link({
                name: 'https://tailwindcss.com/docs',
                href: 'https://tailwindcss.com/docs',
                openInNew: true,
            }),
        }, this);

        const tree = new Tree(this);
        tree.skeleton(async () => {
            const response = await Http.get('/resource/tailwindcss/nav.json');
            response.forEach(({ name, children }) => {
                const node = tree.add({
                    name,
                });
                children.forEach(({ name, href }) => {
                    node.add({
                        name,
                        hasChildren: async n => {
                            const values = await Http.get(`/resource/tailwindcss${href}.json`);
                            const grid = new Grid({
                                columns: [
                                    {
                                        id: 'class',
                                        name: 'Class',
                                        w: 5,
                                        render: value => {
                                            const result = new Plain(value['class']).attr('title', I18n.get('label.copy'));
                                            result.addClass('whitespace-pre-wrap', 'cursor-copy', 'hover:font-bold');
                                            result.on('click', () => new WebClipboard().copy(value['class']));
                                            return result;
                                        },
                                    },
                                    {
                                        id: 'properties',
                                        name: 'Properties',
                                        w: 15,
                                        render: ({ properties }) => {
                                            const result = new UIArray();
                                            if (properties.startsWith('background-color')) {
                                                result.add(new UI('div').addClass('size-6').attr('style', properties));
                                            } else if (properties.startsWith('color:')) {
                                                result.add(new UI('div').addClass('size-6').attr('style', `background-${properties}`));
                                            }
                                            result.add(new Plain(properties).addClass('whitespace-pre-wrap', 'leading-normal'));
                                            return result;
                                        },
                                    },
                                ],
                                data: values,
                            }).addClass('tailwind', 'border-0', 'text-xs').css({
                                fontFamily: 'var(--font-code)',
                                marginLeft: '-1.25rem',
                                maxHeight: '50dvh',
                            });
                            n.add({
                                name: grid,
                            });
                        },
                    });
                });
            });
        });
    }

}

class HtmlEditor extends UI {

    #previewer;

    constructor(parent) {
        super('ui-query-editor', parent);
        this.addClass('block', 'h-full', 'z-0');
    }

    async open({ code = '', monacoEditorVersion, preview, }) {
        if (!QueryEditor.monacoEditorLoaded) {
            await DomUtil.addScript(`/resource/monaco_editor/${monacoEditorVersion}/min/vs/loader.js`);
            QueryEditor.monacoEditorLoaded = true;
        }
        return new Promise((resolve, reject) => {
            require.config({
                paths: {
                    vs: `/resource/monaco_editor/${monacoEditorVersion}/min/vs`
                }
            });
            require(['vs/editor/editor.main'], () => {
                this.editor = monaco.editor.create(this.el, {
                    value: [code].join('\n'),
                    language: 'html',
                    theme: DomUtil.hasClass(document.documentElement, 'dark') ? 'vs-dark' : 'vs',
                    automaticLayout: true,
                });
                Applications.set(ComponentType.MONACO_TAILWINDCSS, this.editor);
                this.editor.onDidChangeModelContent(() => preview(this.code));
                this.editor.focus();
                resolve(this.editor);
            });
        })
    }

    get code() {
        return this.editor.getValue();
    }

    changeTheme(theme) {
        this.editor.updateOptions({ theme: theme });
    }

}
class TextLine extends UI {

    #line;

    #badge;

    #progress;

    constructor(model, parent) {
        super('ui-text-line', parent);
        this.#line = this.child('ui-text-flex');
        if (model.text instanceof UI) {
            this.#line.append(model.text);
        } else if (model.text instanceof Array) {
            model.text.forEach(each => {
                this.#line.append(each);
            });
        } else {
            this.#line.child('span').html(model.text);
        }
        if (model.category) {
            this.attr('data-category', model.category);
        }
        if (model.badge) {
            this.addBadge(model.badge);
        }
        if (model.description) {
            this.child('ui-text-flex', line => {
                if (model.description instanceof UI) {
                    line.append(model.description);
                } else if (Array.isArray(model.description)) {
                    model.description.forEach(each => {
                        line.append(each);
                    })
                } else {
                    line.child('span').html(model.description);
                }
            });
        }

        if (model.listener) {
            this.on('click', model.listener);
        }
    }

    addBadge(badge) {
        this.#badge = new Badge(badge, this.#line);
    }

    showProgress() {
        this.#progress = new Spinner(this.#line);
    }

    clearProgress() {
        if (this.#progress) {
            this.#progress.remove();
            this.#progress = null;
        }
    }

    clearBadge() {
        if (this.#badge) {
            this.#badge.remove();
            this.#badge = null;
        }
    }

}
class ResizableTextarea extends UI {

    constructor(parent) {
        super('textarea', parent);
        this.on('input', each => {
            this.css({
                height: 0,
            });
            this.css({
                height: `${this.el.scrollHeight}px`,
            });
        });
        this.css({ height: '32px' });
    }

    get value() {
        return this.el.value;
    }

    set value(v) {
        this.el.value = v;
        setTimeout(() => {
            this.css({
                height: `${this.el.scrollHeight}px`,
            });
        }, 100);
    }

}
class TimePicker extends UI {

    #hour;

    constructor(parent) {
        super('ui-time-picker', parent);
        this.child('span');
        new Icon('av_timer', this);
        this.on('click', () => {
            const contextMenu = new ContextMenu();
            for (let i = 0; i < 24; i++) {
                contextMenu.add({
                    name: `<ui-hour>${i}</ui-hour>`,
                    listener: () => {
                        this.hour = i;
                    },
                });
            }
            contextMenu.open(this.el);
        });
        this.hour = 0;
    }

    get value() {
        return this.#hour;
    }

    set value(value) {
        this.hour = value;
    }

    set hour(hour) {
        this.#hour = hour;
        this.query('span').innerHTML = hour;
    }

    getHour() {
        return this.#hour * (1000 * 60 * 60);
    }

}

class TimeMinuteField extends Field {

    #hour;

    #minute;

    constructor(model, parent) {
        super(model, parent);
        const picker = new UI('ui-time-minute-picker', this);
        const houres = [];
        for (let i = 0; i < 24; i++) {
            houres.push({
                name: i,
                value: i,
            });
        }
        this.#hour = new Dropdown({
            values: houres,
        }, picker);
        new UI('span', picker).plain(':');
        const minutes = [];
        for (let i = 0; i < 60; i++) {
            minutes.push({
                name: i,
                value: i,
            });
        }
        this.#minute = new Dropdown({
            values: minutes,
        }, picker);
        new Icon('av_timer', picker);
    }

    get value() {
        return {
            hour: this.#hour.value,
            minute: this.#minute.value,
        };
    }

    set value(value) {
        if (value) {
            if (typeof value.hour === 'number') {
                this.#hour.value = value.hour;
            }
            if (typeof value.minute === 'number') {
                this.#minute.value = value.minute;
            }
        }
    }

}
class Timeline extends UI {

    constructor(parent) {
        super('ui-timeline', parent);
    }

    addGroup(name) {
        return new TimelineGroup(name, this);
    }


}

class TimelineGroup extends UI {

    constructor(name, parent) {
        super('section', parent);
        const h1 = new UI('h1', this);
        new UIArray([new Icon('hourglass_empty'), new Plain(name)], h1);
    }

    addUnit(name, message) {
        const div = new UI('div', this);
        new UI('h2', div).html(name);
        new UI('p', div).html(message);
    }

}
class Toggle extends Icon {

    #on;

    #listener;

    constructor(model = {}, parent) {
        super({
            icon: model.value ? 'toggle_on' : 'toggle_off',
            listener: () => {
                this.value = !this.#on;
                this.#callListener();
            },
        }, parent);
        this.addClass('toggle');
        this.#listener = model.listener;
        this.value = model.value ?? false;
    }

    get value() {
        return this.#on;
    }

    set value(value) {
        if (value) {
            this.icon = 'toggle_on';
            this.css({
                color: 'var(--blue)',
            });
        } else {
            this.icon = 'toggle_off';
            this.css({
                color: 'var(--gray-font-color)',
            });
        }
        this.#on = value;
    }

    fire(value) {
        this.value = value;
        this.#callListener();
    }

    #callListener() {
        if (this.#listener) {
            this.#listener(this.#on);
        }
    }

}

class Toggler extends UIArray {

    #toggle;

    constructor(model, parent) {
        super([], parent);
        if (model.name instanceof UI) {
            this.add(model.name);
        } else {
            this.add(new Plain(model.name));
        }
        this.#toggle = new Toggle(model);
        this.add(this.#toggle);
        this.addClass('gap-0');
    }

    fire(value) {
        this.#toggle.fire(value);
    }

    get value() {
        return this.#toggle.value;
    }

    set value(value) {
        this.#toggle.value = value;
    }

}
class TogglePanel extends UI {

    constructor(parent) {
        super('ui-toggle-panel', parent);
        this.selector = new CategorySelector(this.toggle.bind(this), this);
        this.components = new Map();
    }

    toggle(item, selected) {
        if (selected) {
            this.components.forEach((v, k) => {
                if (k === item.ui.uuid) {
                    v.reattach();
                } else {
                    v.detach();
                }
            });
        } else {
            this.components.forEach((v, k) => {
                v.reattach();
            });
        }
    }

    add(name, ui) {
        const item = this.selector.add({
            name: name,
        });
        this.components.set(item.uuid, ui);
        this.append(ui);
    }

}
class Tooltip extends FloatingPanel {

    #panel;

    constructor() {
        super();
        this.#panel = new UI('ui-tooltip', this);
    }

    add(ui) {
        this.#panel.append(ui);
    }

}
class Tree extends UI {

    #items = new Map();

    #selected;

    constructor(parent) {
        super('ui-tree', parent);
    }

    add(model) {
        const result = new TreeItem(model, this);
        return result;
    }

    get(id) {
        return this.#items.get(id);
    }

    put(id, item) {
        this.#items.set(id, item);
    }

    removeItem(id) {
        this.#items.delete(id);
    }

    select(item) {
        if (typeof item === 'string') {
            item = this.#items.get(item);
        }
        if (this.#selected) {
            this.#selected.removeClass('selected');
        }
        if (item) {
            (this.#selected = item).addClass('selected');
            let parent = item.el.parentElement;
            while (parent && parent.tagName === 'UI-TREE-ITEM') {
                parent.classList.add('opened');
                parent = parent.parentElement;
            }
            const { top, bottom, height } = this.#selected.el.getBoundingClientRect();
            const parentRect = this.el.getBoundingClientRect();
            const visible = top <= parentRect.top ? parentRect.top - top <= height : bottom - parentRect.bottom <= height;
            if (!visible) {
                this.el.scrollTop = top - parentRect.top;
            }
        }
    }

    clear() {
        this.#items.clear();
        super.clear();
    }

}

class TreeItem extends UI {

    #tree;

    #nodeIcon;

    #lazyLoader;

    #opened;

    constructor(model, parent, tree) {
        super('ui-tree-item', parent);
        if (model.type) {
            this.el.dataset.type = model.type;
        }
        this.#tree = tree || parent;
        this.#tree.put(model.id, this);
        this.child('div', div => {
            const ua = new UIArray([], div);
            if (model.name instanceof UI) {
                ua.append(model.name);
                if (model.listener) {
                    model.name.addClass('cursor-pointer');
                }
            } else if (Array.isArray(model.name)) {
                model.name.forEach(each => {
                    if (each instanceof UI) {
                        ua.append(each);
                    } else if (typeof each === 'string') {
                        ua.append(document.createTextNode(each));
                    }
                    if (model.listener) {
                        ua.addClass('cursor-pointer');
                    }
                });
            } else {
                new Html(model.name, ua);
                if (model.listener) {
                    ua.addClass('cursor-pointer');
                }
            }
            if (model.labels) {
                new Labels({
                    labels: model.labels,
                    listener: model.enableLabels,
                }, ua);
            }
            if (model.contextMenuLoader) {
                new ContextMenu({
                    type: ContextMenuType.MORE,
                    loader: model.contextMenuLoader,
                    value: model.contextMenuModel,
                }, ua);
            }
            if (model.listener) {
                ua.on('click', event => {
                    const result = model.listener(event);
                    if (result !== EventType.IGNORE) {
                        this.#tree.select(this);
                    }
                });
            } else {
                ua.addClass('cursor-default');
                ua.on('click', event => this.toggle());
            }
            if (model.hasChildren) {
                this.addControl(div);
                if (typeof model.hasChildren === 'function') {
                    this.#lazyLoader = model.hasChildren;
                }
            }
        });
        if (model.open) {
            this.#opened = true;
        }
    }

    get tree() {
        return this.#tree;
    }

    addControl(div) {
        this.#nodeIcon = new Icon({
            icon: 'keyboard_arrow_right',
            listener: this.toggle.bind(this),
        }, div);
    }

    async toggle() {
        if (this.#lazyLoader) {
            this.#nodeIcon.hide();
            const spinner = new Spinner();
            this.#nodeIcon.appendAfter(spinner);
            await this.#lazyLoader(this);
            this.#lazyLoader = null;
            spinner.remove();
            this.#nodeIcon.show();
        }
        if (this.#nodeIcon) {
            this.toggleClass('opened');
            this.#nodeIcon.icon = this.hasClass('opened') ? 'keyboard_arrow_down' : 'keyboard_arrow_right';
        }
    }

    add(model, open = false) {
        if (!this.#nodeIcon) {
            this.#nodeIcon = new Icon({
                icon: 'keyboard_arrow_right',
                listener: this.toggle.bind(this),
            });
            this.query('div').append(this.#nodeIcon.el);
            if (open || this.#opened) {
                this.toggleClass('opened');
            }
        }
        const result = new TreeItem(model, this, this.#tree);
        return result;
    }

    touch() {
        if (this.query('ui-tree-item')) {
            if (!this.#nodeIcon) {
                this.#nodeIcon = new Icon({
                    icon: 'keyboard_arrow_right',
                    listener: this.toggle.bind(this),
                });
                this.query('div').prepend(this.#nodeIcon.el);
                this.query('span').style.marginLeft = 0;
                this.addClass('opened');
            }
        } else if (this.#nodeIcon) {
            this.#nodeIcon.remove();
            this.#nodeIcon = null;
            DomUtil.addClass(this.query('span'), 'ml-5');
        }
    }

    before(node) {
        const beforeParent = node.parent;
        node.parent = this.parent;
        this.el.before(node.el);
        if (beforeParent instanceof TreeItem) {
            beforeParent.touch();
        }
        this.touch();
    }

    after(node) {
        const beforeParent = node.parent;
        node.parent = this.parent;
        this.el.after(node.el);
        if (beforeParent instanceof TreeItem) {
            beforeParent.touch();
        }
        this.touch();
    }

    bottom(node) {
        node.parent = this;
        this.el.append(node.el);
        this.touch();
    }

}
class WebUser extends UI {

    constructor(user, parent) {
        super('ui-user', parent);
        if (typeof user === 'string') {
            this.plain(user);
        } else {
            this.plain(user.name);
        }
    }

}

class NumberUnit extends UI {

    constructor(number, parent) {
        super('ui-number', parent);
        this.plain(WebUtils.formatNumber(number));
    }

}

class DateTime extends UI {

    constructor(time, parent) {
        super('time', parent);
        const d = new Date(time);
        const yyyy = d.getFullYear();
        let MM = d.getMonth() + 1;
        if (MM < 10) {
            MM = '0' + MM;
        }
        let dd = d.getDate();
        if (dd < 10) {
            dd = '0' + dd;
        }
        let hh = d.getHours();
        const a = hh < 12 ? I18n.get('label.time_am') : I18n.get('label.time_pm');
        if (Applications.dateTimeFormat === 'yyyy-MM-dd a hh:mm.ss') {
            if (hh === 0) {
                hh = 12;
            } else if (hh > 12) {
                hh -= 12;
            }
        }
        if (hh < 10) {
            hh = '0' + hh;
        }
        let mm = d.getMinutes();
        if (mm < 10) {
            mm = '0' + mm;
        }
        let ss = d.getSeconds();
        if (ss < 10) {
            ss = '0' + ss;
        }
        switch (Applications.dateTimeFormat) {
            case 'yyyy-MM-dd a hh:mm.ss':
                this.plain(`${yyyy}-${MM}-${dd} ${a} ${hh}:${mm}.${ss}`);
                break;
            case 'yyyy-MM-dd HH:mm.ss':
                this.plain(`${yyyy}-${MM}-${dd} ${hh}:${mm}.${ss}`);
                break;
            default:
                this.plain(`${d.toLocaleDateString()} ${d.toLocaleTimeString()}`);
        }
    }

}

class FileSizeUnit extends UI {

    constructor(size, parent) {
        super('ui-file-size', parent);
        size = size / 1024;
        let m = size / 1024;
        if (m < 1) {
            this.html(`${size.toFixed(2)}KB`);
        } else {
            this.html(`${m.toFixed(2)}MB`);
        }
    }

}

class AuthorAndTime extends UI {

    constructor({ author, time }, parent) {
        super('ui-author-and-time', parent);
        if (author) {
            this.child('span').plain(author);
        }
        if (time) {
            if (time.length === 8) {
                time = `${time.substring(0, 4)}.${time.substring(4, 6)}.${time.substring(6, 8)}`;
            } else {
                time = time.replaceAll('-', '.');
            }
            this.child('span').plain(time);
        }
    }

}

class Bold extends UI {

    constructor(model, parent) {
        super('b', parent);
        if (model) {
            let text = model.text || model;
            if (typeof text === 'string') {
                this.plain(text);
            }
            if (model.type) {
                this.addClass(model.type);
            }
        }
    }

}

class Code extends UI {

    #value;

    constructor(code, parent) {
        super('code', parent);
        this.#value = new UI('span', this);
        if (typeof code === 'string') {
            this.html(code);
        } else if (typeof code === 'object') {
            if (code.code) {
                this.html(code.code);
            }
            if (code.copy) {
                new Icon({
                    icon: 'content_copy',
                    listener: () => new WebClipboard().copy(this.#value.el.innerText),
                }, this).attr('title', I18n.get('label.copy'));
            }
        }
    }

    html(code) {
        this.#value.plain(code);
    }

    plain(code) {
        this.html(code);
    }

}

class Trace extends UI {

    constructor(trace, parent) {
        super('pre', parent);
        this.addClass('code');
        if (typeof trace === 'string') {
            this.plain(trace);
        }
    }

}

class Pre extends UI {

    constructor(content, parent) {
        super('pre', parent);
        if (typeof content === 'string') {
            this.plain(content);
        } else if (content instanceof UI) {
            this.append(content);
        }
    }

}

class Img extends UI {

    constructor(src, parent) {
        super('img', parent);
        this.src = src;
    }

    set src(src) {
        if (typeof src === 'string') {
            this.attr('src', src);
        }
    }

}

class Plain extends UI {

    constructor(text, parent) {
        super('ui-plain', parent);
        this.plain(text);
    }

}

class Html extends UI {

    constructor(html, parent) {
        super('ui-html', parent);
        this.html(html || '');
    }

}

class Paragraph extends UI {

    constructor(content, parent) {
        super('ui-paragraph', parent);
        this.plain(content);
    }

}

class More extends UI {

    constructor({ name = I18n.get('label.more'), listener, icon = 'keyboard_arrow_down' }, parent) {
        super('ui-more', parent);
        new Plain(name, this);
        new Icon(icon, this);
        if (listener) {
            this.on('click', listener);
        }
    }
}
const DomUtil = {

    createElement(tagName, attributes, innerHTML) {
        const result = document.createElement(tagName);
        if (attributes) {
            Object.keys(attributes).forEach(each => {
                result.setAttribute(each, attributes[each]);
            });
        }
        if (innerHTML && tagName !== 'img') {
            result.innerHTML = innerHTML;
        }
        return result;
    },

    show(...els) {
        els.forEach(each => {
            const beforeDisplay = each.getAttribute('data-before-display') || 'block';
            each.style.display = beforeDisplay;
        });
    },

    showByDisplay(display, ...els) {
        if (display) {
            els.forEach(each => {
                each.style.display = display;
            });
        } else {
            DomUtil.show(els);
        }
    },

    hide(...els) {
        els.forEach(each => {
            let display = each.style.display;
            if (!display) {
                display = window.getComputedStyle(each, null).display;
            }
            if (display !== 'none') {
                each.setAttribute('data-before-display', display);
            }
            each.style.display = 'none';
        });
    },

    style(el, name) {
        if (el.el) {
            el = el.el;
        }
        let result = el.style[name];
        if (!result) {
            result = window.getComputedStyle(el, null)[name];
        }
        return result;
    },

    css(el, properties) {
        Object.keys(properties).forEach(k => {
            el.style[k] = properties[k];
        });
    },

    hasClass(el, className) {
        return el && el.classList && el.classList.contains(className);
    },

    addClass(el, ...classNames) {
        if (Array.isArray(el)) {
            el.forEach(each => DomUtil.addClass(each, classNames));
        } else {
            classNames.forEach(each => {
                if (each && !DomUtil.hasClass(el, each)) {
                    el.classList.add(each);
                }
            });
        }
    },

    removeClass(el, ...classNames) {
        classNames.forEach(each => {
            el.classList.remove(each);
        });
    },

    toggleClass(el, ...classNames) {
        classNames.forEach(each => {
            if (DomUtil.hasClass(el, each)) {
                DomUtil.removeClass(el, each);
            } else {
                DomUtil.addClass(el, each);
            }
        });
    },

    appendBegin(el, child) {
        if (typeof child === 'string') {
            el.insertAdjacentHTML('afterbegin', child);
        }
    },

    append(el, child) {
        if (typeof child === 'string') {
            el.insertAdjacentHTML('beforeend', child);
        }
    },

    appendBefore(el, child) {
        if (typeof child === 'string') {
            el.insertAdjacentHTML('beforebegin', child);
            return el.previousSibling;
        }
    },

    appendAfter(el, option) {
        if (option.nodeType === 1 || option.nodeType === 3) {
            el.parentNode.insertBefore(option, el.nextSibling);
            return option;
        } else if (typeof option === 'string') {
            el.insertAdjacentHTML('afterend', option);
        }
    },

    previous(el, selector) {
        let result = el.previousElementSibling;
        while (result && !result.matches(selector)) {
            result = result.previousElementSibling;
        }
        return result;
    },

    next(el, selector) {
        let result = el.nextElementSibling;
        while (result && !result.matches(selector)) {
            result = result.nextElementSibling;
        }
        return result;
    },

    visible(el) {
        return el.style.display !== 'none';
    },

    cumulativeOffset(el) {
        let top = 0, left = 0;
        if (el.parentNode) {
            do {
                top += el.offsetTop || 0;
                left += el.offsetLeft || 0;
                el = el.offsetParent;
            } while (el);
        }
        top = Math.round(top);
        left = Math.round(left);
        return {
            0: left,
            1: top,
            x: left,
            y: top,
            left,
            top,
        };
    },

    async addScript(src) {
        await new Promise((resolve, reject) => {
            const el = document.createElement('script');
            el.src = src;
            el.addEventListener('load', resolve);
            el.addEventListener('error', reject);
            document.body.append(el);
        })
    },

    focus(el) {
        if (el) {
            DomUtil.addClass(el, 'animation_focus');
            el.addEventListener('animationend', () => DomUtil.removeClass(el, 'animation_focus'));
        }
    },

    isInlineElement(el) {
        const inlineTags = [
            'A', 'ABBR', 'ACRONYM', 'B', 'BDO', 'BIG', 'BR', 'CITE', 'CODE',
            'DFN', 'EM', 'I', 'IMG', 'INPUT', 'KBD', 'LABEL', 'MAP', 'OBJECT',
            'OUTPUT', 'Q', 'SAMP', 'SCRIPT', 'SELECT', 'SMALL', 'SPAN', 'STRONG',
            'SUB', 'SUP', 'TEXTAREA', 'TIME', 'TT', 'VAR'
        ];
        return inlineTags.includes(el.tagName);
    },

    changePosition(a, b) {
        const parent = a.parentNode;
        const aNext = a.nextSibling;
        const bNext = b.nextSibling;
        if (aNext === b) {
            parent.insertBefore(b, a);
        } else if (bNext === a) {
            parent.insertBefore(a, b);
        } else {
            parent.insertBefore(a, bNext);
            parent.insertBefore(b, aNext);
        }
    },

}

const WebUtils = {

    getExtension(name) {
        const i = name.lastIndexOf('.');
        if (i !== -1) {
            return name.substring(i + 1).toLowerCase();
        }
    },

    touchSupported() {
        return 'ontouchstart' in document.documentElement;
    },

    underscore(value) {
        return value.split(/\.?(?=[A-Z])/).join('_').toLowerCase();;
    },

    dasherize(value) {
        if (value) {
            return value.replaceAll('_', '-');
        }
    },

    camelize(value) {
        if (value) {
            const length = value.length;
            let result = '';
            for (let i = 0; i < length; i++) {
                const c = value.charAt(i);
                if (c === '-' && i < length - 1) {
                    result += (value.charAt(++i)).toUpperCase();
                } else {
                    result += c;
                }
            }
            return result;
        }
    },

    capitalizeFirstLetter(v) {
        if (!v) {
            return;
        }
        v = v.toLowerCase();
        return v.charAt(0).toUpperCase() + v.slice(1);
    },

    formatNumber(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    validateNumber(e) {
        const el = e.target || e
        if (el.type == "number") {
            if (!el.value && el.dataset.allowEmpty === 'true') {
                return;
            }
            let value = parseFloat(el.value || 0);
            if (el.max) {
                let max = parseFloat(el.max)
                if (value >= max) el.value = el.max
            }
            if (el.min) {
                let min = parseFloat(el.min)
                if (value <= min) el.value = el.min
            }
        }
    },

    validateEmail(email) {
        if (email) {
            email = email.trim();
            const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            return reg.test(email);
        } else {
            return true;
        }
    },

    locale() {
        let result = Applications.user().locale;
        if (result === 'en') {
            result = 'en_US';
        } else if (result === 'zh') {
            result = 'zh_CN';
        }
        return result;
    },

    findValue(value, values) {
        if (!values) {
            return;
        }
        const size = values.length;
        for (let i = 0; i < size; i++) {
            const each = values[i];
            if (each.value === value) {
                return each;
            }
            if (each.children) {
                const result = WebUtils.findValue(value, each.children);
                if (result) {
                    return result;
                }
            }
        }
    },

    escapeHTML(html) {
        if (html) {
            return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        } else {
            return '';
        }
    },

    unescapeHTML(html) {
        if (html) {
            return WebUtils.stripTags(html).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        }
    },

    escapeJson(json) {
        return json.replace(/[\\]/g, '\\\\').replace(/[\"]/g, '\\\"').replace(/[\/]/g, '\\/').replace(/[\b]/g, '\\b').replace(/[\f]/g, '\\f').replace(
            /[\n]/g, '\\n').replace(/[\r]/g, '\\r').replace(/[\t]/g, '\\t');
    },

    stripTags(html) {
        if (html) {
            return html.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?(\/)?>|<\/\w+>/gi, '');
        }
    },

}

const DateUtils = {

    after(date, after) {
        const result = new Date(date);
        result.setDate(result.getDate() + after);
        return result;
    },

    format(date) {
        return date.toLocaleDateString('sv-SE');
    },

    yyyyMMdd(date) {
        return DateUtils.format(date).replace(/-/g, '');
    },

}

const DragUtils = {

    getIcon(event) {
        const icon = document.elementFromPoint(event.x, event.y);
        if (!icon || icon.innerText !== 'drag_indicator') {
            event.preventDefault();
            event.stopPropagation();
            return;
        } else {
            return icon;
        }
    },

    getOvered(event, el, bottom, selector) {
        const result = { el };
        let { y, height } = el.getBoundingClientRect();
        y = event.y - y;
        if (y < height / 2) {
            result.position = 'before';
            const d = selector ? selector(el) : el;
            DomUtil.addClass(d, 'drag_before');
        } else {
            result.position = 'after';
            const d = selector ? selector(el) : el;
            DomUtil.addClass(d, 'drag_after');
        }
        return result;
    },

    clear(el) {
        DomUtil.removeClass(el, 'drag_before', 'drag_after', 'drag_bottom');
    },

    getListItem(event) {
        let result = document.elementFromPoint(event.x, event.y);
        if (result.tagName !== 'UI-LIST-ITEMT2') {
            result = result.closest('ui-list-item');
        }
        return result;
    },

}

const ArrayUtil = {

    compact(array) {
        if (!array) {
            return array;
        }
        return array.filter(each => each);
    },

}
class VisualEditorHandler {

    constructor(editable, id, type, option) {
        this.editable = editable;
        this.id = id;
        this.type = type;
        this.option = option || {};
        // window#removeEventListener 처리를 위해서
        this.receiveMessage = this.receiveMessage.bind(this);
    }

    receiveMessage(event) {
        const type = event.data.type;
        if (type === 'visual-editor-save') {
            this.save(event.data.parameter);
        } else if (type === 'visual-editor-close') {
            this.close(event.data.parameter);
        } else if (type === 'visual-editor-opened') {
            this.load();
        }
    }

    load() {
        this.postMessage({
            type: 'visual-editor-load',
            url: `/r/${this.type}_visual/get/${this.id}`,
        });
    }

    postMessage(message) {
        if (this.iframe) {
            this.iframe.el.contentWindow.postMessage(message, "*");
        }
    }

    open() {
        this.modal = new Modal({
            fullscreen: true,
            closable: () => {
                this.postMessage({
                    type: 'visual-editor-check-change-for-close',
                });
                return false;
            }
        });
        this.iframe = this.modal.addComponent(new UI('iframe'));
        this.iframe.attr('width', '100%');
        this.iframe.attr('height', '100%');
        this.iframe.attr('src', '/r/visual');
        this.iframe.css({
            height: `calc(100dvh - 2rem)`,
        });
        window.addEventListener('message', this.receiveMessage);
    }

    close(parameter) {
        if (!parameter || !I18n.confirm('label.confirm_visual_editor_close')) {
            window.removeEventListener('message', this.receiveMessage);
            this.modal.closeAlways();
        } else {
            this.save(parameter);
        }
    }

    async save(parameter) {
        const response = await Http.post(`/r/${this.type}_visual/save`, {
            ...parameter,
            editable: this.editable,
            id: this.id,
        });
        if (this.option.update) {
            this.option.update(response);
        }
        this.close();
    }

}

class VisualEditorBinder {

    constructor({ id, ui }) {
        if (WebUtils.touchSupported()) {
            return;
        }
        ui.queryAll('p > img, figure > img').forEach(each => {
            if (each.getAttribute('src').indexOf('/r/image/get/') !== 0) {
                return;
            }
            const button = new Button({
                name: I18n.get('label.visual_editor'),
                listener: () => {
                    const src = each.getAttribute('src');
                    const imageId = src.substring(13, 13 + 16);
                    new VisualEditorHandler(id, imageId, 'task', {
                        update: file => {
                            each.setAttribute('src', `/r/image/get/${file.id}`);
                        },
                    }).open();
                }
            });
            each.after(button.el);
        });
    }

}
class Workspace extends UI {

    #header;

    #headerItems = new Map();

    #switchPanel;

    #selectedItem;

    constructor(parent) {
        super('ui-workspace', parent);
        this.#header = this.child('header');
        this.#switchPanel = new SwitchPanel({}, this);
        Applications.addEventListener(EventType.WORKSPACE_ITEM_CHANGED, event => {
            const item = this.#headerItems.get(event);
            if (item) {
                item.changed();
            }
        });
        Applications.addEventListener(EventType.WORKSPACE_ITEM_REMOVED, event => {
            this.removeItem(event);
        });
        Applications.addEventListener(EventType.WORKSPACE_ITEM_SAVED, event => {
            const item = this.#headerItems.get(event);
            if (item) {
                item.saved();
            }
        });
    }

    get selected() {
        return this.#switchPanel.selected;
    }

    get header() {
        return this.#header;
    }

    has(id) {
        return this.#switchPanel.has(id);
    }

    changed() {
        for (let each of this.#headerItems.keys()) {
            if (this.#headerItems.get(each).isChanged()) {
                return true;
            }
        }
        return false;
    }

    open(id) {
        if (this.#selectedItem) {
            delete this.#selectedItem.el.dataset.selected;
        }
        this.#selectedItem = this.#headerItems.get(id);
        this.#selectedItem.el.dataset.selected = 'true';
        return this.#switchPanel.get(id);
    }

    add(model, ui) {
        const { id } = model;
        const item = new WorkspaceItem(model, this);
        this.#headerItems.set(id, item);
        this.#switchPanel.add(id, ui);
        return this.open(id);
    }

    removeItem(id) {
        const item = this.#headerItems.get(id);
        if (!item) {
            return;
        }

        if (item === this.#selectedItem) {
            this.#selectedItem = null;
        }
        this.#headerItems.delete(id);
        item.remove();
        this.#switchPanel.removePanel(id);
        if (!this.#selectedItem && this.#headerItems.size) {
            this.open(this.#headerItems.keys().next().value);
        }
    }

}

class WorkspaceItem extends UI {

    constructor({ id, name }, workspace) {
        super('p', workspace.header);
        this.child('span').html(name);
        new Icon({
            icon: 'close',
            listener: event => {
                event.stopPropagation();
                if (this.isChanged()) {
                    if (!I18n.confirm('label.confirm_close_without_save')) {
                        return;
                    }
                }
                workspace.removeItem(id);
            },
        }, this);
        this.on('click', () => {
            Applications.fire(EventType.WORKSPACE_ITEM_SELECTED, id);
            workspace.open(id)
        });
    }

    isChanged() {
        return this.hasClass('changed');
    }

    changed() {
        this.addClass('changed');
    }

    saved() {
        this.removeClass('changed');
    }

}
