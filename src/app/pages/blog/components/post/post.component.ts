import {Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {BlogService} from "../../blog.service";
import * as markdownIt from "markdown-it";
import * as markdownItEmoji from "markdown-it-emoji";
import * as twemoji from "twemoji";
import {CodemirrorComponent} from 'ng2-codemirror';
import 'codemirror/mode/markdown/markdown.js';
import {LinkmodalComponent} from "./modal/linkmodal/linkmodal.component";
import {FilemodalComponent} from "./modal/filemodal/filemodal.component";
import {TreeModel, Ng2TreeSettings} from 'ng2-tree';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {

  _article: any = {
    id: null,
    subject: null,
    tags: null,
    slug: null,
    summary: null,
    authors: null,
    content: null,
    cate_id: null,
  };
  article;
  id;
  md;
  preview: string;
  editConfig: {};
  codeMirrorInstance;
  tags;
  authors;
  cate_path;
  isCateShow: String = "None";
  isASetShow: String = "None";


  tree: TreeModel;
  treeSettings: Ng2TreeSettings = {
    rootIsVisible: false,
  };
  @ViewChild(CodemirrorComponent) codemirrorComponent: CodemirrorComponent;

  constructor(private notificationsService: NotificationsService,private modalService: NgbModal, private route: ActivatedRoute, private router: Router, private blogService: BlogService) {
    this.editConfig = {
      lineNumbers: false,
      mode: 'markdown',
      lineWrapping: true,
    };
    this.md = new markdownIt({linkify: true});
    this.md.use(markdownItEmoji);
    this.md.renderer.rules.emoji = function (token, idx) {
      return twemoji.parse(token[idx].content);
    };
    this.article = this._article;
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      if (this.id) {
        this.blogService.getArticle(this.id).then((article: any) => {
            if (article.status>0) {
              if (article.category) article.cate_id = article.category.cate_id;

              article.tags = article.tags.map(data => {
                return data.name;
              });
              Object.keys(this._article).map(key => this.article[key] = article[key]);
              if (this.article.content) this.codeMirrorInstance.setValue(this.article.content);
              if (article.category) {
                this.cate_path = article.category.ancestor.map(node => {
                  return node.name
                });
                this.cate_path.push(article.category.name);
              }
            }else{
              this.notificationsService.alert('article',article.msg);
            }
          }
        );
      }
      this.blogService.get_category_tree().then((data: any) => {
        if (Object.keys(data).length === 0)this.treeSettings.rootIsVisible=true;
        data = {
          'cate_id': null, name: 'root', children: data, settings: {
            'static': false,
            'cssClasses': {
              'expanded': 'fa fa-caret-down fa-lg',
              'collapsed': 'fa fa-caret-right fa-lg',
              'leaf:': 'fa fa-lg'
            },
          }
        };
        this.conventTree(data);
        this.tree = <TreeModel>data;
      });

    });
  }

  nodeCreated(tree) {
    this.blogService.post_category({parent_id: tree.parent.node.cate_id, name: tree.value}).then((response: any) => {
      if (response.status>0) {
        tree.node.cate_id = response.cate_id;
      }
    });
  }

  nodeSelected(tree) {
    this.article.cate_id = tree.node.cate_id;
    let paths = [];
    while (true) {
      paths.push(tree.node.value);
      if (!tree.parent) {
        break;
      }
      tree = tree.parent;
    }
    paths.reverse();
    paths.shift();
    this.cate_path = paths;
    this.isCateShow = "None";


  }

  nodeRemoved(tree) {
    this.blogService.delete_category(tree.node.cate_id).then((response: any) => {
      if (response.status >0) {
        this.notificationsService.info('category',response.msg);
      }else{
        this.notificationsService.alert('category',response.msg);
      }
    });
  }

  nodeRenamed(tree) {
    this.blogService.update_category({cate_id: tree.node.cate_id, name: tree.node.value}).then((response: any) => {
      if (response.status >0) {
        this.notificationsService.info('category',response.msg);
      }else{
        this.notificationsService.alert('category',response.msg);
      }
      }
    );
  }

  conventTree(tree) {
    tree['value'] = tree.name;
    if (tree.children) {
      tree.children = Object.keys(tree.children).map(key => tree.children[key]);
      if (tree.children.length == 0) {
        delete tree.children;
        tree.loadChildren = true;
      } else {
        for (let child of tree.children) {
          this.conventTree(child);
        }
      }
    }
  }

  ngAfterViewInit() {
    this.codeMirrorInstance = this.codemirrorComponent.instance;
    this.codeMirrorInstance.setSize("100%", "100%");

  }

  post() {
    if (this.id) {
      this.blogService.update(this.article).then((response: any) => {
        if (response.status >0) {
          this.notificationsService.info('update',response.msg);
        }else{
          this.notificationsService.alert('update',response.msg);
        }
      });
    } else {
      delete this.article.id;
      this.blogService.post(this.article).then((response: any) => {
        if (response.status > 0) {
          this.notificationsService.success('post',response.msg);
          this.id = response.id;
          this.article.id = response.id;
          this.router.navigate(['pages', 'blog', 'post', response.id]);
        }else {
          this.notificationsService.alert('post',response.msg);
        }
      });
    }
  }

  toggleArticleSetView() {
    this.isASetShow = this.isASetShow == "None" ? "block" : 'None';
  }

  onCategory() {
    this.isCateShow = this.isCateShow == "None" ? "inline" : 'None';
  }

  tagChange(value) {
    this.tags = value.trim().split(';');
    this.article.tags = this.tags;
  }

  authorsChange(value) {
    this.authors = value.trim().split(';');
    this.article.authors = this.authors;
  }

  change() {
    this.article.content = this.codeMirrorInstance.getValue();
    this.updatePreview();
  }

  updatePreview() {
    this.preview = this.md.render(this.codeMirrorInstance.getValue());
  }

  getData() {
    return this.md.parse(this.codeMirrorInstance.getValue());
  }

  marks = {
    strong: {
      tag: ['**', '__'],
      start: /(\*\*|__)(?![\s\S]*(\*\*|__))/,
      end: /(\*\*|__)/,
    },
    em: {
      tag: ['*', '_'],
      start: /(\*|_)(?![\s\S]*(\*|_))/,
      end: /(\*|_)/,
    },
    strikethrough: {
      tag: ['~~'],
      start: /(\*\*|~~)(?![\s\S]*(\*\*|~~))/,
      end: /(\*\*|~~)/,
    },
    'code': {
      tag: '```\r\n',
      tagEnd: '\r\n```',
    },
    'unordered-list': {
      replace: /^(\s*)(\*|\-|\+)\s+/,
      tag: '* ',
    },
    'ordered-list': {
      replace: /^(\s*)\d+\.\s+/,
      tag: '1. ',
    },
  };

  /**
   * Return state of the element under the cursor.
   */
  getState() {
    const pos = this.codeMirrorInstance.getCursor('start');
    const stat = this.codeMirrorInstance.getTokenAt(pos);

    if (!stat.type) {
      return [];
    }

    stat.type = stat.type.split(' ');

    if (stat.type.indexOf('variable-2') !== -1) {
      if (/^\s*\d+\.\s/.test(this.codeMirrorInstance.getLine(pos.line))) {
        stat.type.push('ordered-list');
      }
      else {
        stat.type.push('unordered-list');
      }
    }


    return stat.type;
  }

  /**
   * Toggle Markdown block.
   */
  toggleBlock(type) {
    const stat = this.getState(),
      start = this.codeMirrorInstance.getCursor('start'),
      end = this.codeMirrorInstance.getCursor('end');
    let text,
      startText,
      endText;

    // Text is already [strong|italic|etc]
    if (stat.indexOf(type) !== -1) {
      text = this.codeMirrorInstance.getLine(start.line);
      startText = text.slice(0, start.ch);
      endText = text.slice(start.ch);

      // Remove Markdown tags from the text
      startText = startText.replace(this.marks[type].start, '');
      endText = endText.replace(this.marks[type].end, '');

      this.replaceRange(startText + endText, start.line);

      start.ch -= this.marks[type].tag[0].length;
      end.ch -= this.marks[type].tag[0].length;
    }
    else {
      text = this.codeMirrorInstance.getSelection();

      for (let i = 0; i < this.marks[type].tag.length - 1; i++) {
        text = text.split(this.marks[type].tag[i]).join('');
      }

      this.codeMirrorInstance.replaceSelection(this.marks[type].tag[0] + text + this.marks[type].tag[0]);

      start.ch += this.marks[type].tag[0].length;
      end.ch = start.ch + text.length;
    }

    this.codeMirrorInstance.setSelection(start, end);
    this.codeMirrorInstance.focus();
  }

  /**
   * Make selected text strong.
   */
  toggleBold() {
    this.toggleBlock('strong');
  }

  /**
   * Make selected text italicized.
   */
  toggleItalic() {
    this.toggleBlock('em');
  }

  /**
   * Create headings.
   */
  toggleHead() {
    const start = this.codeMirrorInstance.getCursor('start'),
      end = this.codeMirrorInstance.getCursor('end');

    for (let i = start.line; i <= end.line; i++) {
      this.toggleHeading(i);
    }
  }

  replaceRange(text, line) {
    this.codeMirrorInstance.replaceRange(text, {
      line: line,
      ch: 0
    }, {
      line: line,
      ch: 99999999999999
    });
    this.codeMirrorInstance.focus();
  }


  /**
   * Convert a line to a headline.
   */
  toggleHeading(i) {
    let text = this.codeMirrorInstance.getLine(i),
      headingLvl = text.search(/[^#]/);

    // Create a default headline
    if (headingLvl === -1) {
      text = '# Heading';

      this.replaceRange(text, i);
      return this.codeMirrorInstance.setSelection(
        {line: i, ch: 2},
        {line: i, ch: 9}
      );
    }

    // Increase headline level up to 6th
    if (headingLvl < 6) {
      text = headingLvl > 0 ? text.substr(headingLvl + 1) : text;
      text = new Array(headingLvl + 2).join('#') + ' ' + text;
    }
    else {
      text = text.substr(headingLvl + 1);
    }

    this.replaceRange(text, i);
  }

  drawLink() {
    const activeModal = this.modalService.open(LinkmodalComponent);
    activeModal.result.then((url: any) => {
      let cursor = this.codeMirrorInstance.getCursor('start'),
        text = this.codeMirrorInstance.getSelection() || 'Link';

      this.codeMirrorInstance.replaceSelection('[' + text + '](' + url + ')');
      this.codeMirrorInstance.setSelection(
        {line: cursor.line, ch: cursor.ch + 1},
        {line: cursor.line, ch: cursor.ch + text.length + 1}
      );
      this.codeMirrorInstance.focus();
      this.updatePreview();
    });
  }

  addFile() {
    const activeModal = this.modalService.open(FilemodalComponent);
    activeModal.result.then(picture => {
      if (picture) {
        this.codeMirrorInstance.replaceSelection(this.generateImage(picture), true);
        this.codeMirrorInstance.focus();
        this.updatePreview();
      }
    });
  }

  generateLink(data) {
    return '[' + data.name + ']' + '(' + data.url + ')';
  }

  generateImage(data) {
    console.log(data);
    return '!' + this.generateLink(data);
  }

  codeAction() {
    let state = this.getState(),
      start = this.codeMirrorInstance.getCursor('start'),
      end = this.codeMirrorInstance.getCursor('end'),
      text;

    if (state.indexOf('code') !== -1) {
      return;
    }
    else {
      text = this.codeMirrorInstance.getSelection();
      this.codeMirrorInstance.replaceSelection(this.marks.code.tag + text + this.marks.code.tagEnd);
    }
    this.codeMirrorInstance.setSelection({line: start.line + 1, ch: start.ch}, {line: end.line + 1, ch: end.ch});
    this.codeMirrorInstance.focus();
  }

  /**
   * Convert selected text to unordered list.
   */
  ullist() {
    this.toggleLists('unordered-list', null);
  }

  /**
   * Convert selected text to ordered list.
   */
  ollist() {
    this.toggleLists('ordered-list', 1);
  }

  /**
   * Convert several selected lines to ordered or unordered lists.
   */
  toggleLists(type, order) {
    const state = this.getState(),
      start = this.codeMirrorInstance.getCursor('start'),
      end = this.codeMirrorInstance.getCursor('end');
    for (let i = 0; i < end.line - start.line + 1; i++) {
      this.toggleList(type, start.line + i, state, order);
      if (order) {
        order++;
      }
    }
  }

  /**
   * Convert selected text to an ordered or unordered list.
   */
  toggleList(name, line, state, order) {
    let text = this.codeMirrorInstance.getLine(line);
    // If it is a list, convert it to normal text
    if (state.indexOf(name) !== -1) {
      text = text.replace(this.marks[name].replace, '$1');
    }
    else if (order) {
      text = order + '. ' + text;
    }
    else {
      text = this.marks[name].tag + text;
    }

    this.replaceRange(text, line);
  }

  /**
   * Create a divider.
   */
  hrAction() {
    let start = this.codeMirrorInstance.getCursor('start');
    this.codeMirrorInstance.replaceSelection('\r\r-----\r\r');

    start.line += 4;
    start.ch = 0;
    this.codeMirrorInstance.setSelection(start, start);
    this.codeMirrorInstance.focus();
  }

  /**
   * Redo the last action in Codemirror.
   */
  redoAction() {
    this.codeMirrorInstance.redo();
  }

  /**
   * Undo the last action in Codemirror.
   */
  undoAction() {
    this.codeMirrorInstance.undo();
  }

}
