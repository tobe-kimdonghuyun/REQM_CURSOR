const ChapterType = {

    TOC: Symbol(),
    LIST_OF_FIGURES: Symbol(),
    LIST_OF_TABLES: Symbol(),
    LIST_OF_CODES: Symbol(),
    GLOSSARY: Symbol(),
    ABBREVIATION: Symbol(),
    INDEX: Symbol(),

}
class DocumentChapterSelector {

    #modal;

    #id;

    #chaptersPanel;

    #listener;

    constructor({ id } = {}) {
        this.#id = id;
    }

    open(listener) {
        this.#listener = listener;
        if (!this.#modal) {
            this.#modal = new Modal({
                title: I18n.get('label.select_chapter'),
            }).css({
                width: '60rem',
                maxWidth: 'calc(100vw - 20rem)',
            });
            const panel = new UI('ui-h-flex-panel');
            new DocumentTree({
                id: this.#id,
                listener: doc => {
                    this.#chaptersPanel.clear();
                    new TableOfContents({
                        id: doc.id,
                        openInNew: false,
                        listener: chapter => this.#listener(chapter, this),
                    }, this.#chaptersPanel);
                }
            }, panel).addClass('mouseover-scrollbar').css({
                maxHeight: 'calc(100dvh - 20rem)',
                flex: '1',
            });
            this.#chaptersPanel = new UI('div', panel).addClass('mouseover-scrollbar').css({
                maxHeight: 'calc(100dvh - 20rem)',
                flex: '1',
            });
            this.#modal.addComponent(panel);
            if (this.#id) {
                new TableOfContents({
                    id: this.#id,
                    openInNew: false,
                    listener: chapter => this.#listener(chapter, this),
                }, this.#chaptersPanel);
            }
        } else {
            this.#modal.reattach();
        }
    }

    close() {
        this.#modal.detach();
    }

}
class DocumentMap extends Modal {

    #id;

    #depth;

    constructor(id, title) {
        super({
            title,
            fullscreen: true,
        });
        this.#id = id;
        this.addClass('document_map');
        const table = new UI('table');
        this.add(table);
        this.load(id, table);
    }

    async load(id, table) {
        const response = await Http.get(`/r/viewer/chapters/${id}`, true);
        this.#depth = this.getDepth({ chapters: response }) - 1;
        const tbody = new UI('tbody', table);
        response.forEach(each => {
            let tr = new UI('tr', tbody);
            this.render(tbody, tr, 0, each);
        });
    }

    getDepth(node) {
        let depth = 0;
        const children = node.chapters || node.headings;
        if (children) {
            children.forEach(each => {
                let tmpDepth = this.getDepth(each);
                if (tmpDepth > depth) {
                    depth = tmpDepth
                }
            })
        }
        return 1 + depth
    }

    render(tbody, tr, col, node) {
        const size = this.getChildrenSize(node);
        const td = new UI('td', tr);
        if (size > 1) {
            td.attr('rowspan', size);
        }
        new Link({
            name: new Html(node.name),
            listener: event => {
                event.preventDefault();
                window.open(`/r/viewer/book/${this.#id}#${node.id}`);
            },
        }, td);
        let children = node.chapters || node.headings;
        if (children) {
            children.forEach((each, i) => {
                if (i > 0) {
                    this.render(tbody, new UI('tr', tbody), col + 1, each);
                } else {
                    this.render(tbody, tr, col + 1, each);
                }
            });
        } else {
            for (let i = col + 1; i < this.#depth; i++) {
                new UI('td', tr);
            }
        }
    }

    getChildrenSize(node) {
        let result = 0;
        let children = node.chapters || node.headings;
        if (children) {
            children.forEach(each => {
                result += this.getChildrenSize(each);
            });
        } else {
            result = 1;
        }
        return result;
    }

}
class DocumentSelector {

    #option;

    #modal;

    #listener;

    constructor(option = {}) {
        this.#option = option;
    }

    open(listener) {
        this.#listener = listener;
        if (!this.#modal) {
            this.#modal = new Modal({
                title: I18n.get('label.select_book'),
            });
            const panel = new UI('ui-h-flex-panel');
            new DocumentTree({
                id: this.#option.id,
                type: this.#option.type,
                showElement: this.#option.showElement,
                listener: doc => {
                    let title = doc.title;
                    if (title) {
                        const i = title.indexOf('<b>');
                        if (i !== -1) {
                            const j = title.indexOf('</b>', i);
                            doc.title = title.substring(i + 3, j);
                        }
                    }
                    this.#listener(doc, this);
                }
            }, panel);
            this.#modal.addComponent(panel);
        } else {
            this.#modal.reattach();
        }
    }

    close() {
        this.#modal.detach();
    }

}

class DocumentSelectorPanel extends UI {

    constructor({ listener }, parent) {
        super('ui-flex-panel');
        new PageHeader({
            icon: 'docs_add_on',
            title: I18n.get('label.document'),
            subtitle: new Link({
                name: I18n.get('label.dashboard'),
                href: '/!#/r/book',
                openInNew: true,
            }),
        }, this);
        new DocumentTree({
            listener,
            type: 'ALL',
            showElement: true,
        }, this).el.style.margin = '-.5rem';
    }

}

class DocumentTree extends UI {


    #tree;

    #type;

    #showElement;

    #elementType;

    #id;

    #listener;

    #contextMenuLoader;

    #badges;

    constructor({ id, listener, type = 'CHAPTER_SELECTOR', showElement = false, elementType, contextMenuLoader, cache = true, addBadge = false, }, parent) {
        super('ui-document-tree', parent);
        this.#type = type;
        this.#showElement = showElement;
        this.#elementType = elementType || 'ALL';
        this.#id = id;
        this.#listener = listener;
        this.#contextMenuLoader = contextMenuLoader;
        if (addBadge) {
            this.#badges = new Map();
        }
        this.load(cache);
    }

    unselect() {
        this.#tree.select();
    }

    clearBadges() {
        if (this.#badges) {
            [... this.#badges.values()].forEach(each => each.clear());
        }
    }

    getBadge(id) {
        return this.#badges.get(id);
    }

    load(cache) {
        this.skeleton(async () => {
            const { node } = await Http.get(`/r/document/documents/${this.#type}`, cache);
            if (!node || !node.children) {
                new Message(I18n.get('label.empty_row'), this);
                return;
            }
            this.#tree = new Tree(this);
            node.children.forEach(each => this.loadItem(this.#tree, each));
            if (this.#id) {
                this.#tree.select(this.#id);
            }
        }, 10);
    }

    loadItem(treeItem, { id, type, name, children }, parentBadge) {
        const iconedName = Icon.getDocumentIcon(type, name);
        let badge;
        if (this.#badges && id) {
            badge = new Badge();
            if (parentBadge) {
                badge.parentBadge = parentBadge;
            }
            this.#badges.set(id, badge);
        }

        let hasChildren;
        if (!hasChildren && this.#showElement) {
            if (type === 'book_type' || type === 'article_type' || type === 'blog_type') {
                hasChildren = async (treeItem) => {
                    const { node } = await Http.get(`/r/document/document/${id}?type=${this.#elementType}`);
                    if (node && node.children) {
                        node.children.forEach(each => this.loadItem(treeItem, each));
                    }
                }
            }
        }
        const model = {
            id,
            type,
            name: badge ? [iconedName, badge] : iconedName,
            hasChildren,
            contextMenuLoader: this.#contextMenuLoader,
            contextMenuModel: {
                id,
                type,
                name: iconedName,
            }
        };
        if (type !== 'project_type' && id) {
            model.listener = () => {
                if (this.#listener) {
                    this.#listener({
                        id,
                        type,
                        name: iconedName,
                        title: name,
                    });
                }
            };
        }

        const item = treeItem.add(model);
        if (children) {
            children.forEach(each => this.loadItem(item, each, badge));
        }
    }

}
const FeedbackType = {
    NOT_AT_ALL_HELPFUL: Symbol(),
    NOT_VERY_HELPFUL: Symbol(),
    SOMEWHAT_HELPFUL: Symbol(),
    VERY_HELPFUL: Symbol(),
    EXTREMELY_HELPFUL: Symbol(),
}

const FeedbackReasonType = {
    NOT_RELATED_TO_MY_ISSUE: Symbol(),
    TOO_COMPLICATED_EXPLANATIONS: Symbol(),
    SOLUTION_DIDNT_WORK: Symbol(),
    TOO_MUCH_INFORMATION: Symbol(),
    INCORRECT_INFORMATION: Symbol(),
    UNCLEAR_INFORMATION: Symbol(),
    INCOMPLETE_INFORMATION: Symbol(),
}

class FeedbackPanel extends Panel {

    #id;

    constructor(id, parent) {
        super(I18n.get('label.how_helpful_is_this_article'), parent);
        this.#id = id;
        new SingleOptionSelector({
            options: Object.keys(FeedbackType).map(each => {
                return { value: each, name: I18n.get(`label.${each.toLowerCase()}`) };
            }),
            listener: ({ value }) => this.openForm(value),
        }, this);
    }

    openForm(type) {
        const modal = new Modal({
            title: I18n.get(`label.${type.toLowerCase()}`),
        });
        DomUtil.addClass(modal.query('main'), 'flex', 'flex-col', 'gap-8');

        const form = new Form();
        let panel;
        let fields;
        if (type !== 'VERY_HELPFUL' && type !== 'EXTREMELY_HELPFUL') {
            let panel = modal.addComponent(new Panel(I18n.get('label.please_tell_us_why_you_didnt_find_this_answer_helpful')));
            let fields = new Fields({ form }, panel);
            fields.type = 'single';
            const reasons = [];
            Object.keys(FeedbackReasonType).forEach(each => {
                reasons.push({
                    value: each,
                    name: I18n.get(`label.${each.toLowerCase()}`),
                });
            });
            fields.checkboxGroup({
                label: I18n.get('label.please_tell_us_why_you_didnt_find_this_answer_helpful'),
                name: 'reasons',
                values: reasons,
            });
        }

        panel = modal.addComponent(new Panel(I18n.get('label.do_you_have_any_other_feedback_about_this_article')));
        fields = new Fields({ form }, panel);
        fields.type = 'single';
        fields.textarea({
            label: I18n.get('label.do_you_have_any_other_feedback_about_this_article'),
            name: 'comment',
        });
        modal.button({
            name: I18n.get('label.submit'),
            listener: () => {
                this.submit({ type, ...form.parameter }, modal);
            },
        });
        modal.addComponent(form);
    }

    async submit(parameter, modal) {
        await Http.post(`/r/feedback/send/${this.#id}`, parameter);
        this.query('ui-single-option-selector').remove();
        new UIArray([
            new Badge(I18n.get(`label.${parameter.type.toLowerCase()}`)),
            new Message({
                content: I18n.get('label.feedback_recored'),
            }),
        ], this);
        modal.close();
    }

}
class FootnotePanel extends UI {

    #footnotes = new Map();

    constructor({ footnotes, listener }, parent) {
        super('ui-footnote', parent);
        if (footnotes) {
            this.el.dataset.title = I18n.get('label.footnote');
            this.child('ol', ul => {
                footnotes.forEach(each => {
                    this.#footnotes.set(each.id, each);
                    const li = ul.child('li');
                    if (listener) {
                        new Link({
                            name: each.label + '.',
                            listener: () => listener(each),
                        }, li).attr('title', I18n.get('label.to_content'));
                    } else {
                        new UI('span', li).html(each.label + '.');
                    }
                    new UI('span', li).html(each.text).on('click', event => {
                        const a = event.target;
                        if (a.tagName === 'A') {
                            event.preventDefault();
                            let href = a.getAttribute('href');
                            if (DomUtil.hasClass(a, 'reference')) {
                                href = `/r/document/view/${href.substring(1)}`;
                            }
                            const { layoutOption } = Applications.getOption();
                            if (layoutOption && layoutOption.openLinkInCurrent) {
                                window.location.href = href;
                            } else {
                                window.open(href);
                            }
                        }
                    });
                });
            });
        }
    }

    setContentPanel(panel) {
        panel.queryAll('.table_footnotes .footnote_item').forEach(each => {
            const id = Number(each.dataset.footnoteId);
            this.#footnotes.set(id, {
                id,
                elementId: each.dataset.elementId,
                text: each.innerHTML,
            });
        });

        panel.el.addEventListener('click', event => {
            let element = event.target;
            if (DomUtil.hasClass(element, 'footnote')) {
                event.preventDefault();
                event.stopPropagation();
                this.footnote(element);
                return;
            }
        });
    }

    footnote(sup) {
        const id = Number(sup.parentNode.dataset.id);
        const footnote = this.#footnotes.get(id);
        const fp = new FloatingPanel({
            closable: true,
        });
        new UI('ui-footnote-modal', fp).html(footnote.text);
        fp.open(sup);
    }

}

class ChapterContentManager {

    constructor({ fragment = false, panel, footnotes, openLinkInCurrent = false }) {
        panel.el.addEventListener('click', event => {
            let openInNew = false;
            let a = event.target;
            let { tagName } = a;
            if (tagName === 'IMG' && DomUtil.hasClass(a, 'link')) {
                a = a.previousElementSibling;
                openInNew = true;
            }
            if (tagName === 'A') {
                if (DomUtil.hasClass(a, 'reference')) {
                    const id = a.getAttribute('href').substring(1);
                    const element = document.getElementById(id);
                    if (!openInNew && element) {
                        Applications.getApplication().scroll(element);
                    } else if (openInNew) {
                        if (fragment) {
                            window.open(`/r/a/${id}`);
                        } else {
                            window.open(`/r/document/view/${id}`);
                        }
                    } else {
                        if (fragment) {
                            window.location.href = `/r/a/${id}`;
                        } else {
                            window.open(`/r/document/view/${id}`);
                        }
                    }
                    event.preventDefault();
                } else if (!Applications.getOption().openLinkInCurrent) {
                    window.open(a.getAttribute('href'));
                    event.preventDefault();
                }
            } else if (tagName === 'SPAN' && DomUtil.hasClass(a, 'link')) {
                this.openContextMenu(event, a.previousElementSibling);
            }
        });
        if (footnotes && footnotes.length) {
            const footnotePanel = new FootnotePanel({
                footnotes: footnotes,
                listener: footnote => {
                    const sub = panel.query(`#footnote_${footnote.id}`);
                    if (sub) {
                        Applications.getApplication().scroll(sub);
                    }
                },
            });
            footnotePanel.setContentPanel(panel);
            panel.appendAfter(footnotePanel);
        }
    }

    openContextMenu(event, a) {
        const contextMenu = new ContextMenu();
        if (Applications.getOption().exportType !== 'HTML') {
            contextMenu.add({
                name: I18n.get('label.preview'),
                listener: () => {
                    const id = a.dataset.reference || a.getAttribute('href').substring(1);
                    if (id) {
                        let previewer = Applications.get(ComponentType.DOC_PREVIEWER);
                        if (!previewer) {
                            previewer = new DocumentPreviewer();
                            Applications.set(ComponentType.DOC_PREVIEWER, previewer);
                        }
                        previewer.preview(id, a.innerHTML);
                    }
                },
            });
        }
        contextMenu.add({
            name: I18n.get('label.open_link_in_new_window'),
            listener: () => {
                const href = a.getAttribute('href');
                if (href) {
                    window.open(`/r/document/view/${href.substring(1)}`);
                }
            },
        });
        contextMenu.add({
            name: I18n.get('label.open_link_in_current_window'),
            listener: () => {
                const href = a.getAttribute('href');
                if (href) {
                    window.location.href = `/r/document/view/${href.substring(1)}`;
                }
            },
        });
        contextMenu.open(event.x, event.y);
    }

}
class IndexPreviewer extends UI {

    constructor(option) {
        super('ui-index-previewer', document.body);
        new PageHeader({
            ...option,
            icon: 'format_align_right',
        }, this);
        new IndexViewer({
            preview: true,
            ...option,
            listener: id => window.open(`/r/document/open/${id}`),
        }, this);
    }

}

class IndexViewer extends UI {

    constructor(model, parent) {
        super('ui-index-viewer', parent);
        this.skeleton(async () => await this.load(model), 10);
    }

    async load(model) {
        let url;
        if (model.preview) {
            url = `/r/index/get/${model.id}`;
        } else {
            url = `/r/viewer/index/${model.id}`;
        }
        const response = await Http.get(url, true);
        const panel = new TogglePanel(this);
        response.forEach(each => panel.add(each.name, new IndexEntry(each, model.listener)));
    }

}

class IndexEntry extends UI {

    #listener;

    constructor(model, listener) {
        super('ui-index-entry');
        if (listener) {
            this.#listener = () => listener(event.target.getAttribute('href').substring(1));
        }
        new UI('h1', this).plain(model.name);
        this.addEntries(new UI('ul', this), model.entries);
    }

    addEntries(ul, entries) {
        entries.forEach(each => {
            ul.child('li', li => {
                li.html(each.name);
                if (each.locations) {
                    li.child('span', span => {
                        each.locations.forEach(location => {
                            new Link({
                                name: '•',
                                href: location,
                                listener: this.#listener,
                            }, span);
                        });
                    });
                }
                if (each.entries) {
                    this.addEntries(new UI('ul', li), each.entries);
                }
            });
        });
    }

}
class PageSelector extends Modal {

    constructor(model) {
        super({
            title: I18n.get('label.select_page'),
        });
        this.load(model);
    }

    async load({ values, listener }) {
        const pages = await Http.get('/r/web_page/pages');
        const fields = new Fields({ form: new Form(), });
        fields.type = 'option';
        pages.forEach(each => {
            fields.toggle({
                label: each.name,
                value: values.includes(each.id),
                listener: on => {
                    listener(each, on);
                }
            });
        });
        this.add(fields);
    }

}
class DocumentPreviewer extends UI {

    #cache = new Map();

    #tab;

    constructor(parent) {
        super('ui-document-previewer', parent || document.body);
        this.#tab = new Tab({ attach: false, }, this);
        if (!parent) {
            new Icon({
                icon: 'close',
                listener: () => this.hide(),
            }, this);
        }
    }

    preview(id, name) {
        if (this.#cache.has(id)) {
            this.#tab.selectItem(this.#cache.get(id));
        } else {
            const bookId = document.body.dataset.bookId;
            let url = `/r/a/${id}?preview=true`;
            if (bookId) {
                url += `&bookId=${bookId}`;
            }
            if (this.parent !== document.body) {
                url += '&editor=true';
            }
            const item = this.#tab.add(new UIArray([
                new UI('span').html(name),
                new Icon({
                    icon: 'close',
                    listener: event => {
                        event.stopPropagation();
                        const i = this.#tab.closeItem(item);
                        if (this.#tab.count === 0) {
                            this.hide();
                        } else {
                            this.#tab.select(Math.max(0, i - 1));
                        }
                        this.#cache.delete(id);
                    },
                }),
            ]), () => new UI('iframe').attr('src', url));
            this.#cache.set(id, item);
            this.#tab.selectItem(item);
        }
        const { x } = document.querySelector('ui-main').getBoundingClientRect();
        this.css({
            left: `${x}px`,
        });
        this.show();
    }

}
class SeeAlso extends Panel {

    constructor(model, parent) {
        super({
            name: I18n.get('label.related_documents'),
        }, parent);
        const tree = new Tree(this);
        model.forEach(each => {
            if (each.type === 'GROUP') {
                if (each.children) {
                    const node = tree.add({
                        name: each.name,
                        open: true,
                    });
                    each.children.forEach(each => {
                        node.add({
                            name: new Link(each),
                        });
                    });
                }
            } else {
                tree.add({
                    name: new Link(each),
                });
            }
        });
    }

}
