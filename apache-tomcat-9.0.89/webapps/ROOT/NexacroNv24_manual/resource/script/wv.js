class FavoritePanel extends Page {

  #star;

  #mode;

  #panel;

  constructor(star, mode) {
    super({});
    this.#star = star;
    this.#mode = mode || '';
    new PageHeader({
      icon: star ? 'star' : 'update',
      title: I18n.get(star ? 'label.favorites' : 'label.recently_opened_chapters'),
      subtitle: [
        new Link({
          name: I18n.get('label.refresh'),
          listener: () => this.load(),
        }),
      ],
    }, this);
    this.#panel = new UI('div', this);
    this.load();
  }

  async load() {
    this.#panel.clear();
    this.#panel.skeleton(async () => {
      const response = await Http.get(`/r/book_favorite/get/${this.#star}/${this.#mode}`);
      if (response.length) {
        const tree = new Tree(this.#panel);
        tree.css({
          margin: '-.5rem',
        });
        response.forEach(each => {
          const node = tree.add({
            name:
              Icon.getDocumentIcon(each.type, new Link({
                name: new Html(each.title),
                href: each.href,
                openInNew: each.openInNew,
              }).addClass('text-inherit', 'no-underline', 'hover:underline')),
          });
          if (each.items) {
            each.items.forEach(child => {
              node.add({
                name: new Link({
                  name: new Html(child.title),
                  href: child.href,
                  openInNew: child.openInNew,
                }).addClass('text-inherit', 'no-underline', 'hover:underline'),
              }, true);
            });
          }
        });
      } else {
        new Message(I18n.get(this.#star ? 'message.no_favorite' : 'message.no_recently_opened_chapter'), this.#panel);
      }
    }, 10);
  }

}
class DocumentPanel extends UI {

    #moduleType;

    #tree;

    #previewer;

    constructor() {
        super('ui-flex-panel');
        this.#moduleType = document.body.dataset.moduleType;
        new PageHeader({
            title: I18n.get('label.document'),
            subtitle: new Link({
                name: I18n.get('label.refresh'),
                listener: () => this.load(),
            }),
        }, this);
        this.load();
    }

    load() {
        if (this.#tree) {
            this.#tree.remove();
        }
        this.#tree = new DocumentTree({
            listener: this.open.bind(this),
            type: 'ALL',
            showElement: true,
            contextMenuLoader: this.loadContextMenu.bind(this),
            cache: false,
        }, this);
        this.#tree.el.style.margin = '-.5rem';
    }

    open({ id, type }) {
        if (this.#moduleType === 'WV') {
            this.openInCurrent(id, type);
        } else {
            if (type === 'article_type' || type === 'blog_type' || type === 'book_type' || type === 'static_type' || type === 'video_type' || type === 'visual_type' || type === 'mandalart_type') {
                window.location.href = `#/r/book/view/${id}`;
            } else if (type === 'chapter' || type === 'element' || type === 'page') {
                window.open(`/r/document/open/${id}`);
            } else if (type === 'channel_type') {
                window.location.href = `#/r/channel/view/${id}`;
            } else if (type === 'library_type') {
                window.location.href = `#/r/library/view/${id}`;
            }
        }
    }

    openInCurrent(id, type) {
        if (type === 'book_type' || type === 'article_type' || type === 'part' || type === 'chapter' || type === 'element') {
            Applications.getController().changeDocument(id, this);
        } else {
            window.location.href = `/r/document/view/${id}`;
        }
    }

    loadContextMenu(contextMenu, { id, name, type }) {
        if (type === 'article_type' || type === 'blog_type' || type === 'book_type' || type === 'static_type' || type === 'video_type' || type === 'mandalart_type') {
            contextMenu.add({
                id: 'doc_details',
                listener: () => {
                    if (this.#moduleType === 'WV' || this.#moduleType === 'EDITOR') {
                        window.open(`/!#/r/book/view/${id}`);
                    } else {
                        window.location.href = `#/r/book/view/${id}`;
                    }
                },
            });
        }
        if (type === 'library_type') {
            contextMenu.add({
                id: 'dashboard',
                listener: () => {
                    if (this.#moduleType === 'WV') {
                        window.open(`/!#/r/library/view/${id}`);
                    } else {
                        window.location.href = `#/r/library/view/${id}`;
                    }
                },
            });
        }
        if (type === 'channel_type') {
            contextMenu.add({
                id: 'dashboard',
                listener: () => {
                    if (this.#moduleType === 'WV') {
                        window.open(`/!#/r/channel/view/${id}`);
                    } else {
                        window.location.href = `#/r/channel/view/${id}`;
                    }
                },
            });
        }
        if (type === 'article_type' || type === 'blog_type' || type === 'book_type' || type === 'library_type' || type === 'static_type' || type === 'video_type'
            || type === 'chapter' || type === 'element' || type === 'page') {
            contextMenu.add({
                id: 'web_viewer',
                listener: () => window.open(`/r/document/view/${id}`),
            });
            if (this.#moduleType === 'WV') {
                contextMenu.add({
                    id: 'open_in_current_window',
                    name: `${I18n.get('label.web_viewer')}(${I18n.get('label.open_in_current_window')})`,
                    listener: () => this.openInCurrent(id, type),
                });
            }
        }
        if (type === 'chapter' || type === 'element' || type === 'page') {
            contextMenu.add({
                id: 'edit',
                listener: () => window.open(`/r/document/open/${id}`),
            });
        }
        if (type === 'article_type' || type === 'blog_type' || type === 'book_type' || type === 'static_type' || type === 'video_type' || type === 'chapter' || type === 'element') {
            contextMenu.add({
                id: 'preview',
                listener: () => {
                    if (!this.#previewer) {
                        this.#previewer = new DocumentPreviewer();
                    }
                    this.#previewer.preview(id, name.el.innerHTML);
                }
            });
        }
    }

}
/* include app_favorite.js */
/* include book_document.js */

const ElementLocationMode = {

    INDEX: Symbol(),

    SEARCH: Symbol(),

}

class ViewerController {

    #main;

    #previewer;

    constructor() {
        const option = Applications.getOption();
        Applications.set(ComponentType.CONTROLLER, this);
        if (option.layoutOption.disableContentCopy) {
            disableContentCopy();
        }
        if (option.layoutOption.hideNumbering) {
            DomUtil.addClass(document.body, 'r_hide_numbering');
        }
        if (option.layoutOption.alignImageToContent) {
            DomUtil.addClass(document.body, 'r_align_image_to_content');
        }
        WebHistory.init();
        WebHistory.addHandler('open-chapter', param => {
            this.#main.open(param.id);
        });

        let target;
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            target = hash.substring(1);
        } else if (option.chapterId) {
            target = option.chapterId;
        } else if (option.defaultChapterId) {
            target = option.defaultChapterId;
        } else {
            target = option.type === 'ARTICLE' ? option.articleChapterId : option.id;
        }
        this.createApplication(option, target);
        if (target) {
            this.open(target);
        }
        this.moveChapter();
        new BannerManager().openModal(option.banners);

        if (window.parent) {
            new OnMessageHandler(this);
        }
    }

    createApplication(option, target) {
        const query = new QueryString().get('q');
        const app = new Application();
        app.main.addClass('pt-0');
        let documentExplorerIndex = this.configureSidebarButtons(app, option, target, query);
        if (option.libraryId) {
            new LibraryNavigator(app.getTop());
        }
        const p = new UI('div');
        this.#main = new ViewerMain(p);
        app.add(p);
        if (option.footerPage) {
            app.add(new Footer(option.footerPage));
        }
        const { closeSidebarWhenOpening, openDocumentExplorer } = option.layoutOption;
        if (!closeSidebarWhenOpening) {
            if (openDocumentExplorer && Applications.user()) {
                app.runSidebarButton(documentExplorerIndex);
            } else {
                app.runSidebarButton(0);
            }
        }
    }

    configureSidebarButtons(app, option, target, query, documentPanel) {
        let documentExplorerIndex = 1;
        app.addSidebarButton({
            icon: 'manage_search',
            title: I18n.get('label.toc'),
            listener: button => app.openSidebar(button, () => new ViewerTableOfContent(target, query)),
        });
        if (option.enableChatbot) {
            app.addSidebarButton({
                icon: 'support_agent',
                title: I18n.get('label.chatbot'),
                listener: button => app.openSidebar(button, () => {
                    const { originalId, title } = Applications.getOption();
                    return new Chatbot({
                        id: originalId,
                    });
                }),
            });
            documentExplorerIndex++;
        }
        if (option.exportType !== 'HTML' && !option.disableFileExport) {
            app.addSidebarButton({
                icon: 'download',
                title: I18n.get('label.download'),
                listener: button => app.openSidebar(button, () => new ViewerDownload()),
            });
            documentExplorerIndex++;
        }
        const { preview, supportedChapters } = option;
        if (supportedChapters.includes('index') || supportedChapters.includes('glossary') || supportedChapters.includes('abbreviation')) {
            const names = [];
            if (supportedChapters.includes('index')) {
                names.push(I18n.get('label.index'));
            }
            if (supportedChapters.includes('glossary')) {
                names.push(I18n.get('label.glossary'));
            }
            if (supportedChapters.includes('abbreviation')) {
                names.push(I18n.get('label.abbreviation'));
            }
            app.addSidebarButton({
                icon: 'font_download',
                title: names.join('/'),
                listener: button => app.openSidebar(button, () => new BackMatters(supportedChapters)),
            });
            documentExplorerIndex++;
        }
        if (Applications.user()) {
            app.addSidebarButton({
                icon: 'menu',
                title: I18n.get('label.document_explorer'),
                listener: button => app.openSidebar(button, () => documentPanel || new DocumentPanel()),
            });
            app.addSidebarButton({
                icon: 'star',
                title: I18n.get('label.favorites'),
                listener: button => app.openSidebar(button, () => new FavoritePanel(true, 'view')),
            });
        }
        let webPen;
        if (!preview && !option.layoutOption.hidePen) {
            app.addSidebarButton({
                icon: 'gesture',
                title: I18n.get('label.pen'),
                bottom: true,
                listener: () => {
                    if (!webPen) {
                        webPen = new WebPen();
                    }
                    webPen.open(this.chapter);
                },
            });
        }

        if (!preview && option.user) {
            if (option.editable) {
                app.addSidebarButton({
                    icon: 'edit',
                    title: I18n.get('label.edit'),
                    bottom: true,
                    listener: () => {
                        const chapter = this.getMain().selected.chapter;
                        if (chapter) {
                            if (!option.publishing || option.publishing.type !== 'TIME_TAG' || I18n.confirm('label.tagged_chapter_edit_message')) {
                                window.open(`/r/editor/edit/${chapter.originalId}`);
                            }
                        } else {
                            window.open(`/!#/r/book/view/${option.originalId}`);
                        }
                    },
                });
            }
        }
        app.addSidebarButton({
            icon: 'vertical_align_top',
            title: I18n.get('label.to_top'),
            bottom: true,
            listener: () => app.scrollTo(0, 0),
        });
        return documentExplorerIndex;
    }

    moveChapter() {
        document.body.addEventListener('keyup', event => {
            if (document.activeElement === document.body) {
                const { key } = event;
                if (key === 'ArrowRight') {
                    const chapter = this.chapter;
                    if (chapter && chapter.nextChapter) {
                        this.open(chapter.nextChapter.id);
                    }
                } else if (key === 'ArrowLeft') {
                    const chapter = this.chapter;
                    if (chapter && chapter.previousChapter) {
                        this.open(chapter.previousChapter.id);
                    }
                }
            }
        });
    }

    getMain() {
        return this.#main;
    }

    open(id, openInNew = false) {
        this.#main.open(id, openInNew);
    }

    preview(id, name) {
        if (!this.#previewer) {
            this.#previewer = new DocumentPreviewer();
        }
        this.#previewer.preview(id, name);
    }

    get chapter() {
        return this.getMain().selected.chapter;
    }

    async changeDocument(id, documentPanel) {
        const option = await Http.get(`/r/viewer/get_option/${id}`, true);
        Applications.set(ComponentType.APPLICATION_OPTION, option);
        const app = Applications.getApplication();
        app.clearSidebarButtons();
        let documentExplorerIndex = this.configureSidebarButtons(app, option, null, null, documentPanel);
        app.runSidebarButton(documentExplorerIndex);
        this.open(id);
    }

}

class ViewerMain extends SwitchPanel {

    #exportType;

    constructor(parent) {
        super({}, parent);
        this.#exportType = Applications.getOption().exportType;
    }

    open(id, openInNew) {
        const { baseHref, type } = Applications.getOption();
        const bookId = Applications.getId();
        if (id === bookId) {
            if (openInNew) {
                window.open(`/r/document/view/${id}`);
            } else {
                WebHistory.push({
                    type: 'open-chapter',
                    id,
                }, baseHref);
                this.openChapter(bookId, id);
            }
        } else {
            const target = this.query(`[id='${id}']`);
            if (target) { // 현재 보고 있는 장에 이동하려는 단락이 있을 때
                const chapterId = this.selected.id;
                if (openInNew) {
                    if (this.#exportType === 'HTML') {
                        window.open(`${baseHref}#${id}`);
                    } else {
                        window.open(`${baseHref}/${id}`);
                    }
                } else {
                    WebHistory.push({
                        type: 'open-chapter',
                        id: chapterId,
                        element: id,
                    }, `${window.location.pathname}#${id}`);
                    this.openChapter(bookId, chapterId, id);
                }
            } else {
                Http.get(`/r/viewer/get_chapter/${bookId}/${id}`, true).then(({ chapter, href, errorType }) => {
                    if (errorType === 'CONTENT_CREATED_AFTER_TAG') {
                        const modal = new Modal({
                            title: I18n.get('label.notifications'),
                        });
                        modal.add(new Message({
                            content: I18n.get('label.content_created_after_tag'),
                        }));
                        return;
                    }
                    if (openInNew) {
                        if (href) {
                            window.open(href);
                        } else {
                            if (this.#exportType === 'HTML') {
                                window.open(`${baseHref}#${id}`);
                            } else {
                                if (type === 'ARTICLE') {
                                    window.open(!chapter ? baseHref : `${baseHref}#${id}`);
                                } else if (chapter) {
                                    let path = `${baseHref}/${chapter}`;
                                    if (chapter !== id) {
                                        path += `#${id}`;
                                    }
                                    window.open(path);
                                } else {
                                    window.open(`${baseHref}/${id}`);
                                }
                            }
                        }
                    } else {
                        if (href) {
                            window.location.href = href;
                        } else {
                            if (type === 'ARTICLE') {
                                WebHistory.push({
                                    type: 'open-chapter',
                                    id,
                                }, !chapter || id === chapter ? baseHref : `${baseHref}#${id}`);
                                this.openChapter(bookId, chapter || id, id);
                            } else if (chapter) {
                                let path = null;
                                if (this.#exportType === 'HTML') {
                                    path = `#${id}`
                                } else {
                                    path = `${baseHref}/${chapter}`
                                    if (chapter !== id) {
                                        path += `#${id}`;
                                    }
                                }
                                WebHistory.push({
                                    type: 'open-chapter',
                                    id: chapter,
                                    element: id,
                                }, path);
                                this.openChapter(bookId, chapter, id);
                            } else {
                                WebHistory.push({
                                    type: 'open-chapter',
                                    id,
                                }, this.#exportType === 'HTML' ? `${baseHref}#${id}` : `${baseHref}/${id}`);
                                this.openChapter(bookId, id);
                            }
                            Applications.fire(EventType.LOCATION_CHANGED, id);
                        }
                    }
                }).catch(() => {
                    const { origin } = Applications.getOption();
                    if (origin) {
                        window.open(`${origin}r/document/view/${id}`);
                    }
                });
            }
        }
    }

    openChapter(bookId, id, elementId) {
        if (id === elementId) {
            elementId = null;
        }
        Applications.fire(EventType.LOCATION_CHANGED, elementId || id);
        if (this.has(id)) {
            const a = this.get(id);
            if (elementId) {
                a.scrollTo(elementId);
            } else {
                Applications.getApplication().scrollTo(0, 0);
                a.focus();
            }
        } else {
            let view;
            if (id === bookId && Applications.getOption().type === 'BOOK') {
                view = new MainViewer();
            } else {
                view = new ChapterViewer(id, elementId);
            }
            const { alignContentToBrowser, hideChapterToc } = Applications.getOption().layoutOption;
            this.add(id, view, true);
            if (!alignContentToBrowser) {
                view.css({
                    maxWidth: '45rem',
                });
            }
            if (!hideChapterToc) {
                view.css({
                    paddingRight: '20rem',
                });
            }
        }
    }

}
class AbbreviationPanel extends Page {

    constructor(model = {}, parent) {
        super({}, parent);
        this.load(model);
    }

    async load(model) {
        const response = await Http.get(model.url || `/r/viewer/${this.getType()}/${Applications.getId()}`, true);
        const length = response.length;
        if (length) {
            if (length > 1) {
                const panel = new TogglePanel(this);
                response.forEach(each => panel.add(each.name, new EntryPanel(each)));
            } else {
                new EntryPanel(response[0], this);
            }
        } else {
            new Message({
                content: I18n.get('label.empty_row'),
                icon: 'info',
            }, this);
        }
    }

    getType() {
        return 'abbreviation';
    }

}
class BackMatters extends Page {

    constructor(supportedChapters) {
        super({});
        const tab = new Tab({ scrolled: true, }, this);
        if (supportedChapters.includes('index')) {
            tab.add(I18n.get('label.index'), () => new ViewerIndexPanel());
        }
        if (supportedChapters.includes('glossary')) {
            tab.add(I18n.get('label.glossary'), () => new GlossaryPanel());
        }
        if (supportedChapters.includes('abbreviation')) {
            tab.add(I18n.get('label.abbreviation'), () => new AbbreviationPanel());
        }
        tab.select(0);
    }

}
class ChapterViewer extends UI {

    #id;

    #chapter;

    #toc;

    #chapterWriter;

    #offScrollEvent;

    constructor(id, elementId) {
        super('ui-flex-panel');
        this.#id = id;
        this.skeleton(async () => await this.load(elementId), 20);
    }

    panelOpened() {
        if (!this.#chapter) {
            return;
        }
        let { chapterTitle, title } = this.#chapter;
        if (!chapterTitle) {
            chapterTitle = title;
            if (Applications.getOption().layoutOption.hideNumbering) {
                let i = chapterTitle.indexOf('</span>');
                if (i !== -1) {
                    chapterTitle = chapterTitle.substring(i + 7);
                }
            } else {
                let i = chapterTitle.indexOf('<span');
                if (i !== -1) {
                    chapterTitle = chapterTitle.replace('</span>', ' ');
                    chapterTitle = chapterTitle.replace(/<[^>]*>?/g, '');
                }
            }
            this.#chapter.chapterTitle = chapterTitle;
        }
        document.title = chapterTitle;
        if (this.#toc) {
            this.#toc.opened();
        }
    }

    get id() {
        return this.#id;
    }

    get chapter() {
        return this.#chapter;
    }

    async load(elementId) {
        const option = Applications.getOption();
        const chapter = await Http.get(`/r/viewer/content/${Applications.getId()}/${this.#id}`, true);
        this.#chapter = chapter;
        this.panelOpened();
        this.breadcrumb(chapter, option);
        this.header(chapter, option);
        new BannerManager().open(option.banners, this);
        if (chapter.type !== 'PART' && !option.layoutOption.hideChapterToc && !chapter.hideChapterToc) {
            this.#toc = new ChapterTableOfContent(chapter, this);
        } else {
            this.css({
                paddingRight: 0,
            });
        }
        if (chapter.type === 'PART') {
            const { mainType } = option;
            let chapters = await Http.get(`/r/viewer/chapters/${Applications.getId()}`, true);
            const part = chapters.find(each => each.id === chapter.id);
            if (part) {
                chapters = part.chapters;
                if (mainType === 'LIST') {
                    new ViewerListMainPanel(chapters, this);
                } else if (mainType === 'TILE') {
                    new ViewerTileMainPanel(chapters, this);
                } else if (mainType === 'GRID') {
                    new ViewerGridMainPanel(chapters, this);
                }
            }
        }
        const contentPanel = this.child('div', div => {
            this.#chapterWriter = new ChapterWriter(chapter, div)
            this.configureViewer(div, chapter);
        });
        if (chapter.footnotes || contentPanel.query('.table_footnotes')) {
            new FootnotePanel({
                footnotes: chapter.footnotes,
                listener: footnote => {
                    this.scrollTo(footnote.elementId);
                    const sub = this.query(`#footnote_${footnote.id}`);
                    if (sub) {
                        Applications.getApplication().scroll(sub);
                    }
                },
            }, this).setContentPanel(contentPanel);
        }
        this.previousNext(chapter);
        new ChapterTool(chapter, option, this);
        if (!Applications.getOption().footerPage && option.layoutOption.copyright) {
            new UI('ui-viewer-footer', this).html(option.layoutOption.copyright);
        }
        if (this.#toc) {
            this.#toc.observe(new UI(this.query('.chapter_content')));
        }

        if (elementId) {
            setTimeout(() => {
                this.scrollTo(elementId, false);
            }, 100);
        } else {
            this.focus();
        }
    }

    scrollTo(elementId) {
        this.#offScrollEvent = true;
        try {
            if (elementId) {
                const main = document.querySelector('ui-main');
                const { type, element } = Applications.get(ComponentType.MODE) || {};
                const section = this.#chapterWriter.getSection(elementId);
                if (section) {
                    const { ui, index, parentSection } = section;
                    if (parentSection) {
                        parentSection.ui.select(parentSection.index);
                    }
                    ui.select(index);
                }
                const current = main.querySelector(`[id="${elementId}"]`);
                if (current) {
                    const y = main.querySelector('.chapter_content').offsetTop;
                    setTimeout(() => {
                        current.scrollIntoView({
                            behavior: 'smooth',
                        });
                    }, 100);
                    if (type === ElementLocationMode.INDEX) {
                        DomUtil.addClass(current, 'indexed');
                        setTimeout(() => {
                            DomUtil.removeClass(current, 'indexed');
                        }, 10 * 1000);
                    } else if (type === ElementLocationMode.SEARCH) {
                        const footnoteId = element.dataset.footnote;
                        if (footnoteId) {
                            const a = current.querySelector(`#footnote_${footnoteId}`);
                            const fp = new FloatingPanel({
                                closable: true,
                            });
                            new UI('ui-footnote-modal', fp).html(element.innerHTML);
                            fp.open(a);
                        } else {
                            const termId = element.dataset.termId;
                            if (termId) {
                                const dt = current.querySelector(`[id="${termId}"]`);
                                const dd = dt.nextElementSibling;
                                const dtHtml = dt.innerHTML;
                                const ddHtml = dd.innerHTML;
                                dt.innerHTML = element.querySelector('dt').innerHTML;
                                dd.innerHTML = element.querySelector('dd').innerHTML;
                                DomUtil.addClass(current, 'indexed');
                                setTimeout(() => {
                                    dt.scrollIntoView({
                                        behavior: 'smooth',
                                    });
                                }, 100);
                                setTimeout(() => {
                                    dt.innerHTML = dtHtml;
                                    dd.innerHTML = ddHtml;
                                    DomUtil.removeClass(current, 'indexed');
                                }, 10 * 1000);
                            } else {
                                const html = current.innerHTML;
                                current.innerHTML = element.innerHTML;
                                DomUtil.addClass(current, 'indexed');
                                setTimeout(() => {
                                    current.innerHTML = html;
                                    DomUtil.removeClass(current, 'indexed');
                                }, 10 * 1000);
                            }
                        }
                    }
                    this.focus(current);
                }
            } else {
                this.focus();
            }
        } finally {
            Applications.remove(ComponentType.MODE);
            setTimeout(() => {
                this.#offScrollEvent = false;
            }, 200);
        }
    }

    focus(el) {
        if (!el) {
            el = this.query('ui-page-header h1');
            setTimeout(() => {
                el.scrollIntoView({
                    behavior: 'smooth',
                });
            }, 100);
        }
        DomUtil.focus(el);
    }

    breadcrumb(chapter, option) {
        const breadcrumb = new Breadcrumb({
            listener: ({ id }) => Applications.getController().open(id),
        }, this);
        if (option.libraryId) {
            breadcrumb.add({
                id: option.libraryId,
                name: option.libraryName,
                href: option.exportType === 'HTML' ? 'index.html' : `/r/library_search/${option.libraryId}`,
            });
        }
        breadcrumb.addProject(option.project, option.originalId);
        let name = option.name;
        if (!option.layoutOption.hideTagNameInBreadcrumb) {
            const { publishing } = option;
            if (publishing && publishing.type !== 'ALWAYS_PRESENT' && publishing.name) {
                name += `<b>${option.publishing.name}</b>`;
            }
        }
        breadcrumb.add({
            id: option.id,
            name: name,
        });
        if (chapter.part) {
            breadcrumb.add({
                id: chapter.part.id,
                name: chapter.part.title,
            });
        }
        if (option.type === 'BOOK') {
            breadcrumb.add({
                id: chapter.id,
                name: chapter.title,
            });
        }
    }

    header(chapter, option) {
        if (chapter.hidden) {
            new Message(I18n.get('label.this_chapter_is_hidden'), this);
        }
        const subtitle = [];
        if (!option.layoutOption.hideAuthorAndUpdateTime) {
            if (chapter.author) {
                subtitle.push(new UI('span').plain(chapter.author));
            }
            subtitle.push(new DateTime(chapter.time));
        }
        if (option.supportChapterPdfDownload && chapter.type !== 'PART') {
            subtitle.push(new Link({
                name: I18n.get('label.download_pdf'),
                href: `/r/pdf/download_chapter/${option.id}/${chapter.originalId || this.#id}`,
            }));
        }
        if (chapter.labels) {
            subtitle.push(new Labels({
                labels: chapter.labels,
                listener: option.exportType !== 'HTML',
            }));
        }
        new PageHeader({
            title: [
                new Html(chapter.title).addClass(chapter.hidden ? 'line-through' : null),
                () => {
                    if (Applications.user()) {
                        return new Favorite({
                            id: chapter.originalId,
                            type: 'CHAPTER',
                        });
                    }
                },
            ],
            subtitle,
        }, this);
    }

    previousNext(chapter) {
        if (chapter.previousChapter || chapter.nextChapter) {
            new UI('ui-previous-next', this).setUp(ui => {
                let div = new UI('div', ui);
                if (chapter.previousChapter) {
                    new Link({
                        name: new UIArray([
                            new Icon('arrow_back_ios'),
                            new Html(chapter.previousChapter.title),
                        ]),
                        listener: () => Applications.getController().open(chapter.previousChapter.id),
                    }, div);
                }
                div = new UI('div', ui);
                if (chapter.nextChapter) {
                    new Link({
                        name: new UIArray([
                            new Html(chapter.nextChapter.title),
                            new Icon('arrow_forward_ios'),
                        ]),
                        listener: () => Applications.getController().open(chapter.nextChapter.id),
                    }, div);

                }
            });
        }
    }

    configureViewer(panel, chapter) {
        new ElementManager(panel.el, chapter);
        if (Applications.getOption().supportComment) {
            Http.get(`/r/comment/summary/${Applications.getOption().originalId}`, true).then(response => {
                panel.queryAll('.element').forEach(each => {
                    const elementId = each.dataset.elementId;
                    const count = response[elementId];
                    if (count) {
                        new ElementComment().configure(each, count);
                    }
                });
            });
        }
    }

}

class ChapterTool extends UI {

    constructor(chapter, option, parent) {
        super('ui-chapter-tool', parent);
        if (chapter.seeAlsos) {
            new SeeAlso(chapter.seeAlsos, this);
        }
        if (option.supportSharing) {
            new Sharing(this);
        }
        if (chapter.type !== 'PART') {
            if (option.supportFeedback) {
                new FeedbackPanel(chapter.originalId, this);
            }
            if (option.supportComment) {
                new CommentPanel({
                    category: option.originalId,
                    subject: chapter.originalId,
                }, this);
            }
        }
    }

}

class ChapterTableOfContent extends UI {

    #tree;

    constructor({ id, hideTocLevel }, parent) {
        super('ui-chapter-table-of-content', parent);
        this.addClass('w-71', 'w-72', 'flex', 'flex-col', 'gap-4', 'fixed', 'right-8', 'top-16');
        this.load(id, hideTocLevel);
    }

    async load(id, hideTocLevel) {
        let chapter = this.findChapter(await Http.get(`/r/viewer/chapters/${Applications.getId()}`, true), id);
        if (chapter && chapter.headings) {
            new Icon({
                icon: 'playlist_play',
                listener: () => {
                    this.toggleClass('collpased');
                    if (this.hasClass('collpased')) {
                        BrowserOption.set('chapter-table-of-content-collpased', true);
                    } else {
                        BrowserOption.set('chapter-table-of-content-collpased');
                    }
                },
            }, this);
            this.opened();
            chapter = JSON.parse(JSON.stringify(chapter));
            const f = (i) => {
                i.open = true;
                if (i.headings) {
                    i.headings.forEach(each => f(each));
                }
            };
            f(chapter);
            this.#tree = new TableOfContentCreator(hideTocLevel, 'heading5').create({
                type: ChapterType.TOC,
                chapters: chapter.headings,
                listener: id => Applications.getController().open(id),
            });
            this.#tree.addClass('mouseover-scrollbar', 'pl-2');
            this.#tree.css({
                maxHeight: 'calc(100dvh - 8rem)',
            });
            this.append(this.#tree);
        }
    }

    opened() {
        if (BrowserOption.isTrue('chapter-table-of-content-collpased', false)) {
            this.addClass('collpased');
        } else {
            this.removeClass('collpased');
        }
    }

    findChapter(chapters, id) {
        for (let each of chapters) {
            if (each.id === id) {
                return each;
            }
            if (each.chapters) {
                for (let subEach of each.chapters) {
                    if (subEach.id === id) {
                        return subEach;
                    }
                }
            }
        }
    }

    scrolled(element) {
        if (this.#tree) {
            this.#tree.select(element.id);
        }
    }

    observe(panel) {
        const observer = new IntersectionObserver(
            entries => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        this.scrolled(entry.target);
                        break;
                    }
                }
            },
            {
                rootMargin: '-40px 0px -60% 0px',
                threshold: 0
            }
        );
        setTimeout(() => {
            panel.queryAll('.heading1, .heading2, .heading3, .heading4, .heading5').forEach(heading => observer.observe(heading));
        }, 500);
    }

}
class ViewerDownload extends Page {

    constructor() {
        super();
        this.skeleton(async () => {
            new PageHeader({
                icon: 'download',
                title: I18n.get('label.download'),
            }, this);
            const id = Applications.get(ComponentType.APPLICATION_OPTION).id;
            const files = await Http.get(`/r/viewer/get_export_files/${id}`);
            new Grid({
                columns: [
                    {
                        id: 'name',
                        w: 10,
                        render: ({ name, type }) => new Link({
                            name: name,
                            listener: () => {
                                type = type.toLowerCase();
                                const url = `/r/${type}/download/${id}`;
                                window.location.href = url;
                                this.googleAnalytics(type, name, url);
                            },
                        }),
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
                        w: 3
                    },
                    {
                        id: 'createTime',
                        unit: 'dateTime',
                        w: 5,
                    },
                ],
                data: files,
            }, this);
        }, 5);
    }

    googleAnalytics(type, name, url) {
        if (window.gtag) {
            gtag('event', `${type.toLowerCase()}_download`, {
                'file_name': name,
                'file_url': url,
            });
        }
    }

}
class ElementManager {

    #imageViewer;

    constructor(panel, chapter) {
        panel.addEventListener('mouseup', event => {
            let element = event.target;
            const { tagName } = element;
            if (tagName === 'A' && DomUtil.hasClass(element, 'reference')) {
                return;
            }
            if (tagName === 'A' && DomUtil.hasClass(element, 'link')) {
                return;
            }
            if (tagName === 'SPAN' && DomUtil.hasClass(element, 'link')) {
                return;
            }
            if (DomUtil.hasClass(element, 'footnote') || tagName === 'UI-LABEL' || element.closest('UI-LABEL')) {
                return;
            }
            if (!DomUtil.hasClass(element, 'element')) {
                element = element.closest('.element')
                if (!element || !DomUtil.hasClass(element, 'element')) {
                    return;
                }
            }
            const selection = window.getSelection();
            if (selection.rangeCount && !selection.isCollapsed) {
                this.changeRequest(panel, element, selection.getRangeAt(0));
            } else {
                this.elementTool(panel, element);
            }
        });
        panel.addEventListener('click', event => {
            let element = event.target;
            const { tagName } = element;
            if (tagName === 'A') {
                event.preventDefault();
                event.stopPropagation();
                if (DomUtil.hasClass(element, 'reference')) {
                    const id = element.getAttribute('href').substring(1);
                    const { referenceOpenMode, moveReferenceInSameChapter } = Applications.getOption().layoutOption;
                    if (referenceOpenMode === 'NEW_TAB') {
                        if (moveReferenceInSameChapter && panel.querySelector(`[id='${id}']`)) {
                            Applications.getController().open(id);
                        } else {
                            Applications.getController().open(id, true);
                        }
                    } else if (referenceOpenMode === 'CONTEXT_MENU') {
                        this.openContextMenu(event, element);
                    } else {
                        Applications.getController().open(id);
                    }
                } else {
                    const href = element.getAttribute('href');
                    if (Applications.getOption().layoutOption.openLinkInCurrent) {
                        window.location.href = href;
                    } else {
                        window.open(href);
                    }
                }
            } else if (tagName === 'SPAN' && DomUtil.hasClass(element, 'link')) {
                event.preventDefault();
                event.stopPropagation();
                this.openContextMenu(event, element.previousElementSibling);
            }
            let label;
            if (tagName === 'UI-LABEL') {
                label = element;
            } else {
                label = element.closest('UI-LABEL');
            }
            if (label) {
                Labels.load(label, `/r/see_also/label/${label.dataset.id}`);
                event.preventDefault();
                event.stopPropagation();
            }
        });
    }

    openContextMenu(event, a) {
        const contextMenu = new ContextMenu();
        if (Applications.getOption().exportType !== 'HTML') {
            contextMenu.add({
                name: I18n.get('label.preview'),
                listener: () => {
                    const id = a.dataset.reference || a.getAttribute('href').substring(1);
                    if (id) {
                        Applications.getController().preview(id, a.innerHTML);
                    }
                },
            });
        }
        contextMenu.add({
            name: I18n.get('label.open_link_in_new_window'),
            listener: () => {
                const href = a.getAttribute('href');
                if (href) {
                    Applications.getController().open(href.substring(1), true);
                }
            },
        });
        contextMenu.add({
            name: I18n.get('label.open_link_in_current_window'),
            listener: () => {
                const href = a.getAttribute('href');
                if (href) {
                    Applications.getController().open(href.substring(1));
                }
            },
        });
        contextMenu.open(event.x, event.y);
    }

    changeRequest(base, element, range) {
        if (!Applications.getOption().supportFeedback) {
            return;
        }
        const rect = range.getBoundingClientRect();
        const fp = new FloatingPanel({
            base,
        });
        fp.el.style.backgroundColor = 'transparent';
        fp.el.style.border = 'none';
        fp.el.style.boxShadow = 'none';
        fp.el.style.padding = '1px';
        new Button({
            name: I18n.get('label.send_change_request'),
            listener: () => {
                fp.close();
                new ChangeRequest({
                    element,
                    text: range.toString(),
                });
            },
        }, fp);
        fp.open(rect.x, rect.y + rect.height + 4);
    }

    elementTool(base, element) {
        if (DomUtil.hasClass(element, 'inline_see_also') || DomUtil.hasClass(element, 'javascript_module')) {
            return;
        }

        const fp = new FloatingPanel({
            base,
        });
        fp.addClass('element_tool', 'border-0', 'rounded', 'flex', 'gap-4', 'px-2');
        new Icon({
            icon: 'link',
            title: I18n.get('label.copy_path'),
            listener: () => this.copyLink(element),
        }, fp);
        const { exportType, supportComment } = Applications.getOption();
        if (supportComment) {
            new Icon({
                icon: 'comment',
                title: I18n.get('label.comment'),
                listener: () => {
                    fp.close();
                    this.comment(element);
                },
            }, fp);
        }
        if (exportType !== 'HTML') {
            new Icon({
                icon: 'transcribe',
                title: I18n.get('label.change_request'),
                listener: () => {
                    new ChangeRequest({
                        element,
                        text: '',
                    });
                },
            }, fp);
        }
        new Icon({
            icon: 'picture_in_picture',
            title: I18n.get('label.take_out'),
            listener: () => {
                fp.close();
                this.takeOut(element);
            },
        }, fp);
        if ((exportType !== 'HTML' && DomUtil.hasClass(element, 'image')) || DomUtil.hasClass(element, 'code') || DomUtil.hasClass(element, 'command')) {
            if (!DomUtil.hasClass(element, 'command') && (!DomUtil.hasClass(element, 'image') || !Applications.getOption().layoutOption.disableFigureOverlay)) {
                new Icon({
                    icon: 'fullscreen',
                    title: I18n.get('label.maximize'),
                    listener: () => {
                        fp.close();
                        if (DomUtil.hasClass(element, 'image')) {
                            this.maximizeImage(element);
                        } else {
                            this.maximizeCode(element);
                        }
                    },
                }, fp);
            }
        }

        const { x, y } = element.getBoundingClientRect();
        fp.open(x, y - 24);
    }

    comment(element) {
        new ElementComment().open(element);
    }

    copyLink(element) {
        let href = window.location.href;
        let i = href.indexOf('#');
        if (i !== -1) {
            href = href.substring(0, i);
        }
        new WebClipboard().copy({
            text: `${href}#${element.id}`,
            type: 'link',
        });
    }

    takeOut(element) {
        new TakeOutElement(element);
    }

    async maximizeImage(element) {
        if (!this.#imageViewer) {
            this.#imageViewer = new ImageViewer(element);
        } else {
            this.#imageViewer.open(element);
        }
    }

    maximizeCode(element) {
        const caption = element.querySelector('.caption');
        const modal = new Modal({
            title: caption ? caption.innerHTML : I18n.get('label.code'),
            fullscreen: true,
        });
        const pre = new UI('pre', modal.addComponent(new UI('ui-code-viewer')));
        pre.addClass('code', 'outline-0');
        pre.attr('contenteditable', true);
        const code = element.querySelector('pre').cloneNode(true);
        code.querySelectorAll('.code_line').forEach(each => each.remove());
        pre.append(code);
    }

}

class ElementComment {

    #countHolder;

    open(element) {
        const cp = new CommentPanel({
            category: Applications.getOption().originalId,
            subject: element.dataset.elementId,
            type: 'ELEMENT',
        });
        const drawer = new Drawer({
            title: I18n.get('label.comment'),
            closeListener: () => {
                this.configure(element, cp.count);
            },
        });
        drawer.append(cp);
    }

    configure(element, count) {
        if (count === 0 && this.#countHolder) {
            const line = this.#countHolder.parent;
            element.style.marginBottom = DomUtil.style(line, 'marginBottom');
            element.style.paddingBottom = DomUtil.style(line, 'paddingBottom');
            line.remove();
            this.#countHolder = null;
            return;
        }

        if (!this.#countHolder) {
            const marginBottom = DomUtil.style(element, 'marginBottom');
            const paddingBottom = DomUtil.style(element, 'paddingBottom');
            element.style.marginBottom = '0';
            element.style.paddingBottom = '0';
            this.#countHolder = new UI('span');
            const line = new UIArray([
                new Icon('comment'),
                this.#countHolder,
            ]);
            line.css({
                marginBottom,
                paddingBottom,
            }).addClass('w-fit', 'cursor-pointer');
            line.on('click', () => this.open(element));
            DomUtil.appendAfter(element, line.el);
        }
        this.#countHolder.html(count);
    }

}

class ImageViewer {

    #images;

    #modal;

    #breadcrumb;

    #zoomButton;

    #img;

    #current;

    constructor(element) {
        this.loadImages(element);
    }

    async loadImages(element) {
        const chapters = await Http.get(`/r/viewer/chapters/${Applications.getId()}`, true);
        this.#images = [];
        chapters.forEach(each => {
            if (each.figures) {
                each.figures.forEach(f => {
                    this.#images.push({
                        id: f.id,
                        elementId: f.elementId,
                        name: f.name,
                        index: this.#images.length,
                        breadcrumbs: [each.name],
                    });
                });
            }
            if (each.chapters) {
                each.chapters.forEach(c => {
                    if (c.figures) {
                        c.figures.forEach(f => {
                            this.#images.push({
                                id: f.id,
                                elementId: f.elementId,
                                name: f.name,
                                index: this.#images.length,
                                breadcrumbs: [each.name, c.name],
                            });
                        });
                    }
                });
            }
        });
        this.open(element);
    }

    open(element) {
        this.#current = this.#images.find(each => each.id === element.id);
        this.#breadcrumb = new Breadcrumb({}).addClass('text-sm');
        this.#zoomButton = new ZoomButton((v) => this.changeSize());
        this.#modal = new Modal({
            title: this.#breadcrumb,
            fullscreen: true,
        });
        const viewer = this.#modal.addComponent(new UI('ui-image-viewer'));
        viewer.addClass('flex');
        new Icon({
            icon: 'keyboard_arrow_left',
            listener: this.previous.bind(this),
        }, viewer).addClass('text-5xl', 'mt-20', 'hover:font-bold');

        const p = new UI('p', viewer).addClass('mouseover-scrollbar', 'text-center').css({ height: 'calc(100dvh - 8rem)', width: 'calc(100dvw - 8rem)' });
        this.handleMove(p.el);

        this.#img = new UI('img', p);
        this.#img.on('load', () => this.changeSize());
        this.setImage(this.#current);
        new Icon({
            icon: 'keyboard_arrow_right',
            listener: this.next.bind(this),
        }, viewer).addClass('text-5xl', 'mt-20', 'hover:font-bold');
        this.#modal.attr('tabindex', '0');
        this.#modal.on('keyup', ({ key }) => {
            if (key === 'ArrowLeft') {
                this.previous();
            } else if (key === 'ArrowRight') {
                this.next();
            }
        });
        this.#modal.el.focus();
    }

    handleMove(targetElement) {
        let lastX = 0;
        let lastY = 0;
        const down = e => {
            e.preventDefault();
            lastX = e.x;
            lastY = e.y;
            targetElement.addEventListener('pointermove', move, true);
            window.addEventListener('pointerup', up, true);
            targetElement.style.cursor = 'grabbing';
        };
        const up = e => {
            targetElement.removeEventListener('pointermove', move, true);
            window.removeEventListener('pointerup', up, true);
            targetElement.style.cursor = 'default';
        };
        const move = e => {
            const { x, y } = e;
            targetElement.scrollTop += (lastY - y);
            targetElement.scrollLeft += (lastX - x);
            lastX = x;
            lastY = y;
        };
        targetElement.addEventListener('pointerdown', down, true);
    }

    previous() {
        const i = this.#current.index;
        this.#current = this.#images[i === 0 ? this.#images.length - 1 : i - 1];
        this.setImage(this.#current);
    }

    next() {
        const i = this.#current.index;
        this.#current = this.#images[i === this.#images.length - 1 ? 0 : i + 1];
        this.setImage(this.#current);
    }

    setImage(image) {
        this.#img.attr('src', `/r/book_image/get/${image.elementId}`);
        this.#breadcrumb.clear();
        this.#breadcrumb.add(this.#zoomButton);
        image.breadcrumbs.forEach(each => {
            this.#breadcrumb.add({
                name: each,
            });
        });
        this.#breadcrumb.add({
            name: image.name || I18n.get('label.message_no_image_caption'),
        });
    }

    changeSize() {
        const img = this.#img.el;
        const { rate } = this.#zoomButton;
        img.width = img.naturalWidth * rate;
        img.height = img.naturalHeight * rate;
    }

}

class ChangeRequest extends Drawer {

    #panel;

    constructor({ element, text }) {
        super({
            title: I18n.get('label.send_change_request'),
        });
        this.#panel = new UI('ui-flex-panel', this);
        const textarea = new ResizableTextarea(this.#panel).addClass('min-h-40');
        if (text) {
            textarea.value = text;
        }
        new Button({
            name: I18n.get('label.submit'),
            listener: () => this.send(element, textarea.value),
        }, this.#panel);
        textarea.el.focus();
    }

    async send(element, comment) {
        const chapter = Applications.getController().chapter;
        await Http.post(`/r/feedback/send_report/${chapter.originalId}`, {
            element: element.dataset.elementId,
            comment,
        });
        this.#panel.remove();
        new Message(I18n.get('label.change_request_submitted'), this);
    }

}

class TakeOutElement extends UI {

    constructor(element) {
        super('ui-takeout-element', document.body);
        this.addClass('w-80', 'fixed', 'p-3', 'right-4', 'top-4');
        this.css({
            zIndex: '3',
        });
        const div = this.child('div');
        div.addClass('box-border', 'rounded', 'h-full', 'p-4', 'mouseover-scrollbar', 'chapter_content', 'border');
        div.css({
            backgroundColor: 'var(--bg-color)',
        });
        div.append(element.cloneNode(true));
        new Icon({
            icon: 'close',
            title: I18n.get('label.close'),
            listener: () => {
                this.remove();
            },
        }, this);
        new Icon({
            icon: 'open_in_full',
            title: I18n.get('label.move'),
            eventName: 'mousedown',
            listener: (event) => {
                let x = event.x;
                let y = event.y;
                let { width, height } = this.el.getBoundingClientRect();
                const move = e => {
                    const x1 = e.x;
                    const y1 = e.y;
                    width -= (x1 - x);
                    height -= (y - y1);
                    this.el.style.width = `${width}px`;
                    this.el.style.height = `${height}px`;
                    x = x1;
                    y = y1;
                };
                const up = e => {
                    document.body.removeEventListener('mousemove', move);
                    document.body.removeEventListener('mouseup', up);
                };
                document.body.addEventListener('mousemove', move);
                document.body.addEventListener('mouseup', up);
            },
        }, this);
        this.on('click', event => {
            if (event.target.tagName === 'UI-ICON') {
                return;
            }
            document.body.append(this.el);
        });
    }

}
class GlossaryPanel extends AbbreviationPanel {

    constructor(model, parent) {
        super(model, parent);
    }

    getType() {
        return 'glossary';
    }

}
class ViewerIndexPanel extends UI {

  constructor() {
    super('ui-flex-panel');
    new IndexViewer({
      id: Applications.getId(),
      listener: id => {
        Applications.set(ComponentType.MODE, {
          type: ElementLocationMode.INDEX,
        });
        Applications.getController().open(id);
      },
    }, this);
  }

}
class MainViewer extends UI {

    constructor() {
        super('ui-flex-panel');
        this.skeleton(async () => await this.load(), 20);
    }

    async load() {
        const option = Applications.getOption();
        const chapters = await Http.get(`/r/viewer/chapters/${Applications.getId()}`, true);
        this.breadcrumb(option);
        this.header(option);
        new BannerManager().open(option.banners, this);
        this.loadMain(option, chapters);
    }

    panelOpened() {
        document.title = Applications.getOption().title;
    }

    breadcrumb(option) {
        const breadcrumb = new Breadcrumb({
            listener: ({ id }) => {
                Applications.getController().open(id);
            },
        }, this);
        if (option.libraryId) {
            breadcrumb.add({
                id: option.libraryId,
                name: option.libraryName,
                href: option.exportType === 'HTML' ? 'index.html' : `/r/library_search/${option.libraryId}`,
            });
        }
        breadcrumb.addProject(option.project, option.originalId);
        let name = option.name;
        if (!option.layoutOption.hideTagNameInBreadcrumb) {
            const { publishing } = option;
            if (publishing && publishing.type !== 'ALWAYS_PRESENT' && publishing.name) {
                name += `<b>${option.publishing.name}</b>`;
            }
        }
        breadcrumb.add({
            id: option.id,
            name: name,
        });
    }

    header(option) {
        const subtitle = [];
        if (!option.layoutOption.hideAuthorAndUpdateTime) {
            if (option.author) {
                subtitle.push(new UI('span').html(option.author));
            }
            subtitle.push(new DateTime(option.time));
        }
        if (option.labels) {
            subtitle.push(new Labels({
                labels: option.labels,
                listener: option.exportType !== 'HTML',
            }));
        }
        new PageHeader({
            title: [
                new Html(option.name),
                () => {
                    if (Applications.user()) {
                        return new Favorite({
                            id: option.originalId,
                            type: 'BOOK',
                        });
                    }
                },
            ],
            subtitle,
        }, this);
    }

    loadMain(option, chapters) {
        const { mainType, mainPage, layoutOption, seeAlsos } = option;
        if (mainPage) {
            new WebPage(mainPage, this);
        } else {
            if (mainType === 'LIST') {
                new ViewerListMainPanel(chapters, this);
            } else if (mainType === 'TILE') {
                new ViewerTileMainPanel(chapters, this);
            } else if (mainType === 'GRID') {
                new ViewerGridMainPanel(chapters, this);
            }
        }
        new ChapterTool({
            seeAlsos,
            type: 'PART',
        }, option, this);
        if (!Applications.getOption().footerPage && layoutOption.copyright) {
            new UI('ui-viewer-footer', this).html(layoutOption.copyright);
        }
    }

}

class ViewerListMainPanel extends UI {

    constructor(chapters, parent) {
        super('ui-viewer-list', parent);
        this.addClass('flex', 'flex-col', 'gap-8', 'text-sm');
        const tree = new TableOfContentCreator(Applications.getOption().hideMainTocLevel, 'heading5').create({
            chapters,
            listener: (id) => {
                const c = Applications.getController();
                if (c.open) {
                    c.open(id);
                } else {
                    window.open(`/r/document/view/${id}`);
                }
            },
        });
        tree.addClass('w-fit');
        this.append(tree);
    }

}

class ViewerTileMainPanel extends UI {

    constructor(items, parent) {
        super('ui-h-flex-panel', parent);
        this.load(items);
    }

    load(items) {
        const { color, exportType } = Applications.getOption();
        items.forEach(each => {
            const t = new UI('ui-viewer-tile', this);
            t.el.dataset.type = each.type;
            t.addClass('flex', 'flex-col', 'gap-2', 'w-60');
            new Icon(each.icon || 'north_east', t).attr('data-color', each.color || color);
            new UIArray([
                new Link(getChapterLinkOption(each), t).addClass('w-fit'),
                () => {
                    if (each.labels) {
                        return new Labels({
                            labels: each.labels,
                            listener: exportType !== 'HTML',
                        }, t);
                    }
                }
            ], t);
            if (each.subject) {
                new UI('p', t).html(each.subject);
            }
            if (each.chapters) {
                const div = new UI('div', t).addClass('flex', 'flex-col', 'gap-1');
                each.chapters.forEach(inner => {
                    new UIArray([
                        new Link(getChapterLinkOption(inner)),
                        () => {
                            if (inner.labels) {
                                return new Labels({
                                    labels: inner.labels,
                                    listener: exportType !== 'HTML',
                                });
                            }
                        }
                    ], div);
                });
            } else if (each.headings) {
                const div = new UI('div', t).addClass('flex', 'flex-col', 'gap-1');
                each.headings.forEach(inner => new Link(getChapterLinkOption(inner), div));
            }
        });
    }

}

class ViewerGridMainPanel extends UI {

    constructor(items, parent) {
        super('ui-flex-panel', parent);
        const { color, exportType } = Applications.getOption();
        items.forEach(each => this.gridItem(each, color, exportType, this));
    }

    gridItem(each, color, exportType, parent, inPart) {
        const t = new UI('ui-viewer-grid', parent).addClass('flex', 'gap-4');
        new Icon(each.icon || 'north_east', t).attr('data-color', each.color || color);
        new UIArray([
            new Link(getChapterLinkOption(each)),
            () => {
                if (each.labels) {
                    return new Labels({
                        labels: each.labels,
                        listener: exportType !== 'HTML',
                    });
                }
            },
        ], new UI('header', t));
        new UI('main', t).setUp(main => {
            if (each.subject) {
                new UI('p', main).html(each.subject);
            }
            if (each.headings) {
                const div = new UI('div', main).addClass('flex', 'flex-col', 'gap-1');
                each.headings.forEach(inner => {
                    new UIArray([
                        new Link(getChapterLinkOption(inner)),
                        () => {
                            if (inner.labels) {
                                return new Labels({
                                    labels: inner.labels,
                                    listener: exportType !== 'HTML',
                                });
                            }
                        }
                    ], div);
                });
            }
        });
        if (each.chapters) {
            each.chapters.forEach(each => this.gridItem(each, color, exportType, parent).addClass('chapter_in_part'));
            t.addClass('part');
        }
        return t;
    }

}

const getChapterLinkOption = model => {
    const result = {
        name: new Html(model.name),
    };
    if (model.externalUrl) {
        result.href = model.externalUrl;
        if (model.openInNew) {
            result.openInNew = true;
        }
    } else {
        result.listener = event => {
            event.preventDefault();
            Applications.getController().open(model.id);
        };
    }
    return result;
}
class OnMessageHandler {

    constructor(controller) {
        window.addEventListener('message', event => {
            const { type } = event.data;
            if (type === 'get-document-profile') {
                const option = Applications.getOption();
                const parameter = {
                    type: 'document-profile',
                    document: {
                        id: option.originalId || option.id,
                        type: option.type,
                        title: option.title,
                    },
                };
                const { chapter } = controller;
                if (chapter) {
                    parameter.chapter = {
                        id: chapter.originalId || chapter.id,
                        title: chapter.chapterTitle,
                        type: chapter.type,
                    };
                }
                window.parent.postMessage(parameter, '*');
            } else if (type === 'change-document-location') {
                controller.open(event.data.id);
            }
        });
    }

}
class ViewerSearchPanel extends UI {

    #searchBox;

    #panel;

    #result;

    constructor(query, parent) {
        super('ui-flex-panel', parent);
        this.addClass('gap-4');
        const { id, exportType, originalId, libraryId, enableChatbot, supportSearchSuggestions, } = Applications.getOption();
        const isHtml = exportType === 'HTML';
        this.#searchBox = new SearchBox({
            filter: isHtml ? null : this.getFilter(),
            keywordSuggestion: isHtml ? null : originalId,
            listener: this.search.bind(this),
            suggestion: supportSearchSuggestions ? originalId : null,
        }, this);
        if (libraryId || enableChatbot) {
            const p = new UI('p', this).addClass('flex', 'gap-4');
            if (libraryId) {
                new Link({
                    name: I18n.get('label.library_search'),
                    href: exportType === 'HTML' ? 'index.html' : `/r/library_search/${libraryId}`,
                }, p);
            }
            if (enableChatbot) {
                new Link({
                    name: I18n.get('label.chatbot'),
                    listener: () => Applications.getApplication().runSidebarButton(1),
                }, p);
            }
        }
        this.#panel = new UI('div');
        if (query) {
            this.#searchBox.search(query);
        }
    }

    get panel() {
        return this.#panel;
    }

    getFilter() {
        const filter = [
            {
                id: 'base',
                name: I18n.get('label.option'),
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
                        name: I18n.get('label.heading'),
                        value: 'HEADING',
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
        return filter;
    }

    search(query) {
        this.parent.tab = 0;
        if (Applications.getOption().exportType === 'HTML') {
            this.reset();
            this.show(HtmlExport.search(Applications.getId(), query), query);
        } else {
            this.reset();
            Http.monitor({
                url: `/r/viewer/search/${Applications.getId()}`,
                parameter: query,
                progress: this.#panel,
                listener: response => {
                    if (response.completed) {
                        this.show(response, query);
                    }
                },
                interval: 300,
            });
        }
    }

    reset() {
        if (this.#result) {
            this.#result.remove();
        }
    }

    show(result, query) {
        if (!result.count) {
            this.#result = new Message(I18n.get('label.string_not_found'), this.#panel);
            return;
        }

        this.#result = new UI('ui-flex-panel', this.#panel);

        const { libraryId, exportType } = Applications.getOption();
        if (libraryId) {
            new Link({
                name: new Html(I18n.get('label.search_library_by_keyword', query.query)),
                href: exportType === 'HTML' ? `index.html?q=${query.query}` : `/r/library_search/${libraryId}?q=${query.query}`,
                openInNew: true,
            }, this.#result,
            ).addClass('r_library_search_suggestion');
        }

        const accordion = new Accordion(this.#result);
        accordion.on('click', event => {
            const element = event.target.closest('.element');
            if (element) {
                event.preventDefault();
                Applications.set(ComponentType.MODE, {
                    type: ElementLocationMode.SEARCH,
                    element,
                });
                Applications.getController().open(element.id);
            }
        });
        result.chapters.forEach((each, i) => {
            accordion.add(new TextLine({
                text: each.title,
                category: WebUtils.stripTags(each.partTitle),
                badge: each.count,
            }), new SearchedContent({ item: each, selectable: true }), i === 0);
        });
    }

}
class ViewerTableOfContent extends UI {

    #progress;

    #tab;

    constructor(target, query) {
        super('ui-flex-panel');
        this.css({
            gap: '1rem',
        });
        this.#progress = new BarProgress(this);
        this.monitor();
        this.load(target, query);
    }

    monitor() {
        if (Applications.getOption().exportType === 'HTML') {
            return;
        }
        setTimeout(async () => {
            const { rate } = await Http.get(`/r/viewer/get_progress_rate/${Applications.getId()}`);
            if (this.#progress) {
                this.#progress.rate = rate;
                this.monitor();
            }
        }, 500);
    }

    set tab(tabIndex) {
        if (!this.#tab) {
            setTimeout(() => this.tab = tabIndex, 300);
        } else {
            this.#tab.select(tabIndex);
        }
    }

    async load(target, query) {
        const chapters = await Http.get(`/r/viewer/chapters/${Applications.getId()}`, true);
        this.#progress.remove();
        this.#progress = null;
        const searcher = new ViewerSearchPanel(query, this);
        if (Applications.getOption().type === 'ARTICLE') {
            chapters[0].open = true;
        }
        const { supportedChapters } = Applications.getOption();
        this.#tab = new Tab({ scrolled: true, }, this);
        this.#tab.add(new Icon({ icon: 'search', title: I18n.get('label.search') }), () => searcher.panel);
        this.#tab.add(new Icon({ icon: 'menu', title: I18n.get('label.toc') }), () => this.createTree(ChapterType.TOC, chapters, target, Applications.getOption().hideTocLevel, Applications.getOption().unfoldTocLevel));
        if (supportedChapters.includes('figure')) {
            this.#tab.add(new Icon({ icon: 'image', title: I18n.get('label.list_of_figures') }), () => this.createTree(ChapterType.LIST_OF_FIGURES, chapters));
        }
        if (supportedChapters.includes('table')) {
            this.#tab.add(new Icon({ icon: 'table', title: I18n.get('label.list_of_tables') }), () => this.createTree(ChapterType.LIST_OF_TABLES, chapters));
        }
        if (supportedChapters.includes('code')) {
            this.#tab.add(new Icon({ icon: 'code', title: I18n.get('label.list_of_codes') }), () => this.createTree(ChapterType.LIST_OF_CODES, chapters));
        }
        this.tab = query ? 0 : 1;
    }

    createTree(type, chapters, target, hideTocLevel, unfoldTocLevel) {
        return new TableOfContentCreator(hideTocLevel, unfoldTocLevel).create({
            type,
            chapters,
            target,
            listener: this.open.bind(this),
        });
    }

    open(id) {
        Applications.getController().open(id);
    }

}

class TableOfContentCreator {

    #hideTocLevel;

    #unfoldTocLevel;

    #listener;

    constructor(hideTocLevel, unfoldTocLevel) {
        if (hideTocLevel !== 'none') {
            this.#hideTocLevel = hideTocLevel;
        }
        if (unfoldTocLevel !== 'none') {
            this.#unfoldTocLevel = unfoldTocLevel;
        }
    }

    create({ type, chapters, target, listener }) {
        this.#listener = listener;
        const tree = new Tree(this);
        chapters.forEach(each => {
            const item = this.loadChapter(tree, each, type);
            if (each.chapters) {
                each.chapters.forEach(e => {
                    this.loadChapter(item, e, type);
                });
            }
        });
        Applications.addEventListener(EventType.LOCATION_CHANGED, id => tree.select(id));
        if (target) {
            tree.select(target);
        }
        return tree;
    }

    loadChapter(item, model, type) {
        if (!item) {
            return;
        }
        if (type === ChapterType.LIST_OF_FIGURES) {
            if (model.chapters) {
                if (!model.chapters.find(each => each.figures)) {
                    return;
                }
            } else if (!model.figures) {
                return;
            }
        } else if (type === ChapterType.LIST_OF_TABLES) {
            if (model.chapters) {
                if (!model.chapters.find(each => each.tables)) {
                    return;
                }
            } else if (!model.tables) {
                return;
            }
        } else if (type === ChapterType.LIST_OF_CODES) {
            if (model.chapters) {
                if (!model.chapters.find(each => each.codes)) {
                    return;
                }
            } else if (!model.codes) {
                return;
            }
        }
        const treeOption = {
            id: model.id,
            name: model.name,
            open: this.opened(model),
            labels: model.labels,
            enableLabels: Applications.getOption().exportType !== 'HTML',
            listener: () => {
                if (model.externalUrl) {
                    window.location.href = model.externalUrl;
                } else {
                    this.#listener(model.id);
                }
            },
        };
        if (model.externalUrl) {
            treeOption.name = [
                new UI('span').html(model.name),
                new Icon({
                    icon: 'open_in_new',
                    listener: event => {
                        event.stopPropagation();
                        window.open(model.externalUrl);
                    },
                })
            ];
        }
        const result = item.add(treeOption);
        this.loadChildren(result, model, type);
        return result;
    }

    loadChildren(item, model, type) {
        if (type === ChapterType.TOC && !model.headings) {
            return;
        }
        if (type === ChapterType.LIST_OF_FIGURES) {
            (model.figures || []).forEach(each => {
                item.add({
                    id: each.id,
                    name: each.name || I18n.get('label.omit_caption'),
                    listener: () => this.#listener(each.id),
                });
            });
        } else if (type === ChapterType.LIST_OF_TABLES) {
            (model.tables || []).forEach(each => {
                item.add({
                    id: each.id,
                    name: each.name || I18n.get('label.omit_caption'),
                    listener: () => this.#listener(each.id),
                });
            });
        } else if (type === ChapterType.LIST_OF_CODES) {
            (model.codes || []).forEach(each => {
                item.add({
                    id: each.id,
                    name: each.name || I18n.get('label.omit_caption'),
                    listener: () => this.#listener(each.id),
                });
            });
        } else if (model.headings) {
            model.headings.forEach(each => {
                if (this.#hideTocLevel === each.type) {
                    return;
                }
                const child = item.add({
                    id: each.id,
                    name: each.name,
                    open: this.opened(each),
                    listener: () => this.#listener(each.id),
                });
                this.loadChildren(child, each);
            });
        }
    }

    opened(model) {
        if (!this.#unfoldTocLevel) {
            return false;
        }
        const { type } = model;
        if (!type) {
            return false;
        }
        if (this.#unfoldTocLevel === 'chapter_title') {
            return type === 'PART';
        } else if (this.#unfoldTocLevel === 'heading1') {
            return !type.startsWith('heading');
        } else if (this.#unfoldTocLevel === 'heading2') {
            return !type.startsWith('heading') || type === 'heading1';
        } else if (this.#unfoldTocLevel === 'heading3') {
            return !type.startsWith('heading') || type === 'heading1' || type === 'heading2';
        } else if (this.#unfoldTocLevel === 'heading4') {
            return !type.startsWith('heading') || type === 'heading1' || type === 'heading2' || type === 'heading3';
        } else if (this.#unfoldTocLevel === 'heading5') {
            return !type.startsWith('heading') || type === 'heading1' || type === 'heading2' || type === 'heading3' || type === 'heading5';
        }
    }


}
