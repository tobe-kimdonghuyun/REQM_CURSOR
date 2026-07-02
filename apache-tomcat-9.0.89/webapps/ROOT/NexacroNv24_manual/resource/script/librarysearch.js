class LibraryController {

    #option = Applications.getOption();

    #main;

    #previewer;

    constructor() {
        Applications.set(ComponentType.CONTROLLER, this);
        this.createApplication();
    }

    createApplication() {
        const { id, user } = this.#option;
        const option = this.#option;
        const app = new Application();
        app.addSidebarButton({
            icon: 'menu',
            title: I18n.get('label.document_explorer'),
            listener: button => app.openSidebar(button, () => new LibraryDocuments(option)),
        });
        if (user) {
            if (user.editable) {
                app.addSidebarButton({
                    icon: 'edit',
                    bottom: true,
                    title: I18n.get('label.edit'),
                    listener: () => window.open(`/!#/r/library/view/${id}`),
                });
            }
        }
        app.addSidebarButton({
            icon: 'vertical_align_top',
            bottom: true,
            title: I18n.get('label.to_top'),
            listener: () => app.scrollTo(0, 0),
        });
        new LibraryNavigator(app.getTop());
        this.#main = app.add(new LibraryMain(option));
        if (option.footerPage) {
            app.add(new Footer(option.footerPage));
        }
        if (option.showSidebar) {
            app.runSidebarButton(0);
        }
        if (window.parent) {
            this.onMessage();
        }
    }

    onMessage() {
        window.addEventListener('message', event => {
            const { type } = event.data;
            if (type === 'get-document-profile') {
                const { id } = Applications.getOption();
                window.parent.postMessage({
                    type: 'document-profile',
                    library: {
                        id,
                        type: 'LIBRARY',
                    },
                }, '*');
            }
        });
    }

    getMain() {
        return this.#main;
    }

    preview(id, name) {
        if (!this.#previewer) {
            this.#previewer = new DocumentPreviewer();
        }
        this.#previewer.preview(id, name);
    }

}

class LibraryMain extends UI {

    #switchPanel;

    constructor(option) {
        super('ui-flex-panel');
        new LibrarySearcher(option, this);
        this.#switchPanel = new SwitchPanel({}, this);
        if (!option.documents.length && !Applications.user()) {
            new Message(I18n.get('label.login_required_for_library', window.location.pathname), this);
        }
        const main = new UI('div');
        new WebPage(option.page.mainPage, main);
        this.#switchPanel.add('main', main, true);
    }

    add(id, ui) {
        this.#switchPanel.add(id, ui, true);
    }

    show(id) {
        this.#switchPanel.get(id);
    }

}

class KeepLibrary {

    constructor({ id, keepLibrary, }, href, openInNew) {
        if (keepLibrary) {
            const flag = href.indexOf('?') === -1 ? `?_l=${id}` : `&_l=${id}`;
            const i = href.indexOf('#');
            if (i === -1) {
                href += flag;
            } else {
                href = href.substring(0, i) + flag + href.substring(i);
            }
        }
        if (openInNew) {
            window.open(href);
        } else {
            window.location.href = href;
        }
    };

}
class LibraryDocuments extends UI {

    #searchResult = new Map();

    #documents = new Map();

    constructor(option) {
        super('ui-flex-panel');
        const accordion = new Accordion(this);
        option.documents.forEach(each => {
            this.#documents.set(each.id, new LibraryDocument(each, accordion, this));
        });
        Applications.addEventListener(EventType.SEARCH_STARTED, () => {
            this.#searchResult.clear();
            this.#documents.forEach(each => each.start());
        });
        Applications.addEventListener(EventType.SEARCH_PROGRESS, event => {
            if (event.subworks) {
                event.subworks.forEach(each => {
                    if (each.completed) {
                        const d = this.#documents.get(each.id);
                        if (d) {
                            d.count = each.count;
                        }
                    }
                });
            }
        });
        Applications.addEventListener(EventType.SEARCH_COMPLETED, event => {
            if (!event.completed) { // 검색 초기화
                this.#documents.values().forEach(each => {
                    accordion.append(each.ui);
                    each.count = 0;
                });
                return;
            }
            const counts = new Map();
            if (event.subworks) {
                event.subworks.forEach(each => {
                    const { id, count } = each;
                    this.#searchResult.set(id, each);
                    counts.set(id, count);
                });
            }
            this.#documents.forEach((value, id) => value.count = counts.get(id) || 0);
            const values = Array.from(this.#documents.values());
            values.sort((a, b) => b.count - a.count);

            const { hideDocumentsWithoutSearchResults } = Applications.getOption();
            values.forEach(each => {
                if (hideDocumentsWithoutSearchResults) {
                    if (each.count) {
                        accordion.append(each.ui);
                    } else {
                        each.ui.detach();
                    }
                } else {
                    accordion.append(each.ui);
                }
            });
            if (values.length) {
                const id = values[0].id;
                values[0].select();
                this.addSearchResult(id, this.getSearched(id));
            }
        });
    }

    getSearched(id) {
        return this.#searchResult.get(id);
    }

    addSearchResult(id, result) {
        const main = Applications.get(ComponentType.CONTROLLER).getMain();
        if (main) {
            if (result) {
                main.add(id, new LibrarySearchResult(result));
            } else {
                main.add(id, new Message(I18n.get('label.string_not_found')));
            }
        } else {
            setTimeout(() => this.addSearchResult(id, result), 300);
        }
    }

}

class LibraryDocument {

    static selected;

    #id;

    #accordionItem;

    #tl;

    #count = 0;

    constructor({ id, type, title }, accordion, parent) {
        this.#id = id;
        const { exportType } = Applications.getOption();
        const text = [Icon.getDocumentIcon(type, title)];
        if (type === 'BOOK' && exportType !== 'HTML') {
            text.push(new Icon({
                icon: 'apps',
                listener: event => {
                    event.preventDefault();
                    event.stopPropagation();
                    new DocumentMap(id, title);
                },
            }));
        }
        this.#tl = new TextLine({
            text,
            listener: event => {
                const searchResult = parent.getSearched(id);
                if (searchResult) {
                    event.stopPropagation();
                    this.select();
                    Applications.get(ComponentType.CONTROLLER).getMain().add(id, new LibrarySearchResult(searchResult));
                }
            },
        });
        this.#accordionItem = accordion.add(this.#tl, new LazyPanel(() => {
            return new TableOfContents({
                id,
                exportType,
                listener: ({ id, title, href }, openInNew, event) => {
                    href = href || `/r/document/view/${id}`;
                    if (openInNew) {
                        const contextMenu = new ContextMenu();
                        if (exportType !== 'HTML') {
                            contextMenu.add({
                                name: I18n.get('label.preview'),
                                listener: () => {
                                    Applications.getController().preview(id, title);
                                },
                            });
                        }
                        contextMenu.add({
                            name: I18n.get('label.open_link_in_new_window'),
                            listener: () => {
                                new KeepLibrary(Applications.getOption(), href, true);
                            },
                        });
                        contextMenu.add({
                            name: I18n.get('label.open_link_in_current_window'),
                            listener: () => {
                                new KeepLibrary(Applications.getOption(), href, false);
                            },
                        });
                        contextMenu.open(event.x, event.y);
                    } else {
                        new KeepLibrary(Applications.getOption(), href, openInNew);
                    }
                },
            });
        }));
    }

    select() {
        if (LibraryDocument.selected) {
            LibraryDocument.selected.removeClass('selected');
        }
        (LibraryDocument.selected = this.#tl).addClass('selected');
    }

    start() {
        this.count = 0;
        this.#tl.clearBadge();
        this.#tl.showProgress();
    }

    get id() {
        return this.#id;
    }

    get count() {
        return this.#count;
    }

    set count(count) {
        this.#count = count;
        this.#tl.clearProgress();
        this.#tl.clearBadge();
        this.#tl.addBadge(count);
    }

    get ui() {
        return this.#accordionItem;
    }

}
class LibraryDownloadController {

    constructor(option) {
        Applications.set(ComponentType.APPLICATION_OPTION, option);
        Applications.set(ComponentType.CONTROLLER, this);
        this.createApplication();
    }

    createApplication() {
        const app = new Application();
        app.addSidebarButton({
            icon: 'vertical_align_top',
            bottom: true,
            title: I18n.get('label.to_top'),
            listener: () => app.scrollTo(0, 0),
        });
        new LibraryNavigator(app.getTop());
        app.add(new LibraryDownload());
    }

}

class LibraryDownload extends Page {

    constructor() {
        super();
        this.load();
    }

    async load() {
        const { libraryId, libraryName } = Applications.getOption();
        const breadcrumb = new Breadcrumb({}, this);
        breadcrumb.add({
            id: libraryId,
            name: libraryName,
            href: `/r/library_search/${libraryId}`,
        });
        breadcrumb.add({
            name: I18n.get('label.download'),
        });

        const documents = await Http.get(`/r/library_download/${Applications.getOption().libraryId}/documents`);
        new Grid({
            columns: [
                {
                    id: 'name',
                    w: 10,
                    render: ({ documentId, type, name }) => new Link({
                        name: name,
                        href: `/r/${type.toLowerCase()}/download/${documentId}`,
                    }),
                    sortable: false,
                },
                {
                    id: 'type',
                    w: 3,
                    render: ({ type }) => new Plain(I18n.get(`label.${type.toLowerCase()}`)),
                    sortable: false,
                },
                {
                    id: 'size',
                    unit: 'file',
                    w: 3,
                    sortable: false,
                },
                {
                    id: 'createTime',
                    unit: 'dateTime',
                    w: 5,
                    sortable: false,
                },
            ],
            data: documents,
        }, this);
    }

}
class LibraryNavigator {

    #parent;

    constructor(parent) {
        this.#parent = parent;
        this.load();
    }

    async load() {
        let { id, libraryId, originalId, } = Applications.getOption();
        if (originalId) {
            id = originalId;
        }
        let library;
        if (id === 'all') {
            library = {
                items: [],
            };
        } else {
            library = await Http.get(`/r/library_search/get_items/${libraryId}`, true);
            const f = (each) => {
                if (each.bookId === id && !each.item) {
                    each.selected = true;
                }
                if (each.children) {
                    each.children.forEach(c => f(c));
                }
            };
            library.items.forEach(each => {
                if (each.type === 'MENU_GLOSSARY') {
                    each.listener = () => {
                        this.openGlossary(each.bookId);
                    };
                }
                f(each);
            });
        }
        new Navigator(library, this.#parent);
    }

    openGlossary(id) {
        DrawerManager.toggle(id, () => {
            const drawer = new Drawer({
                title: I18n.get('label.glossary'),
            });
            new GlossaryPanel({
                url: `/r/library_search/glossary/${Applications.getOption().libraryId}/${id}`,
            }, drawer);
            return drawer;
        });
    }

}
class LibrarySearcher extends SearchBox {

    constructor(option, parent) {
        super({
            filter: option.exportType === 'HTML' ? null : LibrarySearcher.getFilter(option),
            listener: query => this.searchLibrary(query, option),
        }, parent);
        const q = this.queryString('q');
        if (q) {
            this.search(q);
        }
    }

    searchLibrary(query, option) {
        const q = (query.query || '').trim();
        if (!q) {
            Applications.fire(EventType.SEARCH_STARTED);
            Applications.fire(EventType.SEARCH_COMPLETED, {});
            return;
        }
        const app = Applications.getApplication();
        const i = app.getCurrentButtonIndex();
        if (i !== 0) {
            app.runSidebarButton(0);
        }
        Applications.fire(EventType.SEARCH_STARTED);
        if (option.exportType === 'HTML') {
            HtmlExport.searchLibrary(q);
        } else {
            Http.monitor({
                url: `/r/library_search/${option.id}?keyword=${q}`,
                parameter: query,
                listener: response => {
                    if (response.completed) {
                        Applications.fire(EventType.SEARCH_COMPLETED, response);
                    } else {
                        Applications.fire(EventType.SEARCH_PROGRESS, response);
                    }
                },
            });
        }
    }

    static getFilter(option) {
        const filter = [
            {
                id: 'base',
                name: I18n.get('label.name'),
                options: [
                    {
                        name: I18n.get('label.case_sensitive'),
                        value: 'caseSensitive',
                    },
                    {
                        name: I18n.get('label.search_any_word'),
                        value: 'anyWord',
                    },
                ],
            },
            {
                id: 'type',
                name: I18n.get('label.type'),
                options: [
                    {
                        name: I18n.get('label.all'),
                        value: 'all',
                        checked: true,
                    },
                    {
                        name: I18n.get('label.heading'),
                        value: 'HEADING',
                        checked: true,
                    },
                    {
                        name: I18n.get('label.code'),
                        value: 'CODE',
                    },
                    {
                        name: I18n.get('label.table'),
                        value: 'TABLE',
                    },
                    {
                        name: I18n.get('label.image'),
                        value: 'IMAGE',
                    },
                    {
                        name: I18n.get('label.text'),
                        value: 'TEXT',
                    },
                ],
            }
        ];
        const documentOption = {
            id: 'document',
            layout: 'column',
            name: I18n.get('label.document'),
            options: [],
        };
        documentOption.options.push({
            name: I18n.get('label.all'),
            value: 'all',
            checked: true,
        });
        option.documents.forEach(each => {
            documentOption.options.push({
                name: each.title,
                value: each.id,
            });
        });
        filter.push(documentOption);
        return filter;
    }

}

class LibrarySearchResult extends UI {

    #exportType = Applications.getOption().exportType;

    constructor(result) {
        super('ui-flex-panel');
        new PageHeader({
            title: result.title,
            icon: 'manage_search',
            subtitle: new UI('p').setUp(p => {
                new Link({
                    name: I18n.get('label.back'),
                    listener: () => Applications.get(ComponentType.CONTROLLER).getMain().show('main'),
                }, p);
                new Badge(result.count, p);
            }),
        }, this);

        const accordion = new Accordion(this);
        accordion.addClass('search_result');
        result.chapters.forEach(each => {
            const panel = new UI('div').addClass('chapter_content', 'searched_content');
            const links = new UIArray([], panel).css({
                marginBottom: '1rem',
            });
            if (this.#exportType !== 'HTML') {
                new Link({
                    name: I18n.get('label.preview'),
                    listener: () => Applications.getController().preview(`${result.bookId}/${each.id}`, each.title),
                    openInNew: true,
                }, links);
            }
            new Link({
                name: I18n.get('label.open'),
                href: each.href || `/r/viewer/book/${result.id}#${each.id}`,
                openInNew: true,
            }, links);
            new SearchedContent({ item: each }, panel);
            accordion.add(new TextLine({
                text: each.title,
                badge: each.count,
            }), panel, true);
        });
    }

}
class StaticLibraryController {

    constructor() {
        Applications.set(ComponentType.CONTROLLER, this);
        this.createApplication();
    }

    createApplication() {
        const app = new Application();
        app.addSidebarButton({
            icon: 'vertical_align_top',
            bottom: true,
            title: I18n.get('label.to_top'),
            listener: () => this.scroll(),
        });
        new LibraryNavigator(app.getTop());
        app.add(new StaticPanel());
    }

    scroll() {
        const iframe = document.querySelector('iframe');
        iframe.contentWindow.scrollTo(0, 0);
    }

}

class StaticPanel extends UI {

    constructor() {
        super('iframe');
        this.attr('src', Applications.getOption().defaultUrl);
    }

}
