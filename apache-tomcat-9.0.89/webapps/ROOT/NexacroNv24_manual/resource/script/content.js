class ChapterWriter {

    #panel;

    constructor(chapter, panel) {
        this.#panel = panel;
        panel.addClass('chapter_content');
        const elements = [];
        let node, step;
        chapter.elements.forEach(each => {
            const { type } = each;
            if (type.startsWith('heading')) {
                step = null;
                const level = Number(type.replace('heading', ''));
                each.headingLevel = level;
                if (node) {
                    if (node.headingLevel < level) { // 새로운 단락이 하위일 때
                        each.parent = node;
                        (node.children ||= []).push(each);
                        node = each;
                    } else if (node.headingLevel === level) { // 새로운 단락이 같은 수준일 때
                        const parent = node.parent;
                        each.parent = parent;
                        if (parent) {
                            (parent.children ||= []).push(each);
                        } else {
                            elements.push(each);
                        }
                        node = each;
                    } else { //새로운 단락이 상위일 때
                        let parent = node;
                        while (parent && parent.headingLevel >= level) {
                            parent = parent.parent;
                        }
                        if (!parent) {
                            elements.push(each);
                        } else {
                            each.parent = parent;
                            (parent.children ||= []).push(each);
                        }
                        node = each;
                    }
                } else {
                    node = each;
                    elements.push(each);
                }
            } else {
                if (type === 'step1') {
                    step = each;
                    if (node) {
                        (node.children ||= []).push(each);
                    } else {
                        elements.push(each);
                    }
                } else {
                    if (step && each.ignoreStepIndent) {
                        step = null;
                    }
                    if (step) {
                        (step.children ||= []).push(each);
                    } else if (node) {
                        (node.children ||= []).push(each);
                    } else {
                        elements.push(each);
                    }
                }
            }
        });
        const { sectionView } = chapter;
        if (sectionView === 'ACCORDION' || sectionView === 'OPENED_ACCORDION') {
            this.writeAccordion(null, panel, elements, sectionView === 'OPENED_ACCORDION');
        } else if (sectionView === 'TAB') {
            this.writeTab(null, panel, elements);
        } else {
            elements.forEach(each => this.write(null, panel, each, sectionView));
        }
    }

    write(parentSection, panel, element, sectionView) {
        if (element.headingLevel) {
            const section = new UI('section', panel);
            if (sectionView) {
                section.addClass(`section_${sectionView.toLowerCase()}`);
            }
            let main;
            new Icon({
                icon: 'keyboard_arrow_down',
                title: I18n.get('label.collapse'),
                listener: (event, icon) => {
                    if (icon.icon === 'keyboard_arrow_down') {
                        icon.icon = 'keyboard_arrow_right';
                        icon.attr('title', I18n.get('label.expand'));
                        main.hide();
                    } else {
                        icon.icon = 'keyboard_arrow_down';
                        icon.attr('title', I18n.get('label.collapse'));
                        main.show();
                    }
                },
            }, section);
            new UI('header', section).append(element);
            if (element.children) {
                main = new UI('main', section);
                const { sectionView, children } = element;
                if (sectionView === 'ACCORDION' || sectionView === 'OPENED_ACCORDION') {
                    this.writeAccordion(parentSection, main, children, sectionView === 'OPENED_ACCORDION');
                } else if (sectionView === 'TAB') {
                    this.writeTab(parentSection, main, children);
                } else {
                    element.children.forEach(each => this.write(parentSection, main, each));
                }
            }
        } else if (element.type === 'step1') {
            this.writeStep(parentSection, panel, element);
        } else {
            this.writeElement(panel, element);
        }
        if (parentSection) {
            this.setSection(element, parentSection);
        }
    }

    #sections = new Map();

    getSection(id) {
        return this.#sections.get(id);
    }

    setSection(element, section) {
        const { id, contextId } = element;
        if (!this.#sections.has(id)) {
            this.#sections.set(id, section);
        }
        if (contextId && !this.#sections.has(contextId)) {
            this.#sections.set(contextId, section);
        }
    }

    writeAccordion(parentSection, panel, elements, opened) {
        let accordion = null;
        elements.forEach(each => {
            const { type, headingLevel, sectionView, children } = each;
            if (headingLevel) {
                if (!accordion) {
                    accordion = new Accordion(panel);
                }
                const section = {
                    ui: accordion,
                    index: accordion.count,
                    parentSection,
                };
                const main = new UI('main');
                if (children) {
                    if (sectionView === 'ACCORDION' || sectionView === 'OPENED_ACCORDION') {
                        this.writeAccordion(section, main, children, sectionView === 'OPENED_ACCORDION');
                    } else if (sectionView === 'TAB') {
                        this.writeTab(section, main, children);
                    } else {
                        children.forEach(each => this.write(section, main, each));
                    }
                    children.forEach(child => this.setSection(child, section));
                }
                const name = each.html.replaceAll(`<h${headingLevel}`, '<div').replaceAll(`</h${headingLevel}>`, '</div>');
                accordion.add(new UI('div').html(name), main, opened);
                this.setSection(each, section);
            } else if (type === 'step1') {
                this.writeStep(parentSection, panel, each);
            } else {
                this.writeElement(panel, each);
            }
        });
    }

    writeTab(parentSection, panel, elements) {
        if (!elements && !elements.length) {
            return;
        }
        const main = new UI('main', panel);
        let tab = null;
        elements.forEach(each => {
            const { type, headingLevel, sectionView, children } = each;
            if (headingLevel) {
                if (!tab) {
                    tab = new Tab({}, main).addClass('my-16');
                }
                const section = {
                    ui: tab,
                    index: tab.count,
                    parentSection,
                };
                const name = each.html.replaceAll(`<h${headingLevel}`, '<div').replaceAll(`</h${headingLevel}>`, '</div>');
                const tabItemMain = new UI('main');
                if (children) {
                    if (sectionView === 'ACCORDION' || sectionView === 'OPENED_ACCORDION') {
                        this.writeAccordion(section, tabItemMain, children, sectionView === 'OPENED_ACCORDION');
                    } else if (sectionView === 'TAB') {
                        this.writeTab(section, tabItemMain, children);
                    } else {
                        children.forEach(each => this.write(section, tabItemMain, each));
                    }
                    children.forEach(child => this.setSection(child, section));
                }
                tab.add(new UI('div').html(name), tabItemMain);
                this.setSection(each, section);
            } else if (type === 'step1') {
                this.writeStep(parentSection, panel, each);
            } else {
                this.writeElement(main, each);
            }
        });
        if (tab) {
            tab.select(0);
        }
        return main;
    }

    writeStep(parentSection, panel, element) {
        const section = new UI('section', panel);
        new UI('header', section).append(element);
        if (element.children) {
            let opened = true;
            const main = new UI('main', section).addClass('step_section');
            element.children.forEach(each => this.write(parentSection, main, each));
            section.query('.step1_n').addEventListener('mouseup', event => {
                event.preventDefault();
                event.stopPropagation();
                opened = !opened;
                if (opened) {
                    main.show();
                } else {
                    main.hide();
                }
            });
        }
    }

    writeElement(panel, element) {
        const { type, html, footnote, indented } = element;
        if (html) {
            const el = panel.append(element);
            if (type === 'code') {
                const pre = el.query('pre');
                DomUtil.addClass(pre, 'mobile-scroll');
                this.addCodeCopyIcon(pre);
            } else if (type === 'command') {
                el.addClass('mobile-scroll');
                this.addCodeCopyIcon(el.el);
            } else if (type === 'table' && footnote) {
                panel.append({
                    html: footnote,
                });
            } else if (type === 'javascript_module') {
                IMAGE_LAZY_LOADER.observe(el.query('ui-javascript-module'));
            }
            if (indented) {
                el.addClass(indented);
            }
        }
    }

    addCodeCopyIcon(pre) {
        new Icon({
            icon: 'content_copy',
            title: I18n.get('label.copy'),
            listener: (event, icon) => {
                event.stopPropagation();
                new WebClipboard().copy({
                    text: pre,
                    type: 'code',
                }, false);
                icon.icon = 'check';
                setTimeout(() => icon.icon = 'content_copy', 2000);
            },
        }, pre);
    }

    scrollTo(elementId) {
        const section = this.getSection(elementId);
        if (section) {
            const { ui, index, parentSection } = section;
            if (parentSection) {
                parentSection.ui.select(parentSection.index);
            }
            ui.select(index);
        }
        const current = this.#panel.query(`[id="${elementId}"]`);
        if (current) {
            setTimeout(() => {
                current.scrollIntoView({
                    behavior: 'smooth',
                });
            }, 100);
            DomUtil.focus(current);
        }
    }

}
class SearchedContent extends UI {

    constructor({ item, selectable }, parent) {
        super('div', parent);
        this.addClass('chapter_content', 'searched_content', 'flex', 'flex-col', 'gap-8');
        const { elements, footnotes } = item;
        if (elements) {
            elements.forEach(element => {
                const el = this.append({ html: element });
                if (selectable) {
                    el.addClass('cursor-pointer');
                }
            });
        }
        if (footnotes) {
            footnotes.forEach(footnote => {
                const el = this.append({ html: `<div id="${footnote.elementId}" class="element normal" data-footnote="${footnote.id}">${footnote.text}</div>` });
                if (selectable) {
                    el.addClass('cursor-pointer');
                }
            });
        }
    }

}
