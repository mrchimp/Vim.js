/**
 * Created by top on 15-9-6.
 */
const _ENTER_ = '\n';
var el;

exports._init = function (element) {
    el = element;
}

exports.setEle = function(e){
    el = e;
}

exports.getText = function(sp, ep) {
    if (sp !== undefined || ep !== undefined) {
        return el.value.slice(sp, ep);
    }
    return el.value;
};

exports.setText = function (t) {
    el.value = t;
};

exports.getSelectedText = function() {
    //var t = document.getSelection() || document.selection.createRange().text;
    var t;
    if(document.selection){
        t = document.selection.createRange().text;// for IE
    } else {
        t = el.value.substring(el.selectionStart, el.selectionEnd);
    }
    return t + '';
};

exports.getCursorPosition = function () {
    if (document.selection) {
        el.focus();
        var ds = document.selection;
        var range = ds.createRange();
        var stored_range = range.duplicate();
        stored_range.moveToElementText(el);
        stored_range.setEndPoint("EndToEnd", range);
        el.selectionStart = stored_range.text.length - range.text.length;
        el.selectionEnd = el.selectionStart + range.text.length;
        return el.selectionStart;
    } else {
        return el.selectionStart
    }
};

exports.getSelectEndPos = function () {
    if (document.selection) {
        el.focus();
        var ds = document.selection;
        var range = ds.createRange();
        var stored_range = range.duplicate();
        stored_range.moveToElementText(el);
        stored_range.setEndPoint("EndToEnd", range);
        el.selectionStart = stored_range.text.length - range.text.length;
        el.selectionEnd = el.selectionStart + range.text.length;
        return el.selectionEnd;
    } else {
        return el.selectionEnd;
    }
};

exports.select = function (start, end) {
    if (start > end) {
        var p = start;
        start = end;
        end = p;
    }
    if (start < 0) {
        start = 0;
    }
    if (end > this.getText().length) {
        end = this.getText().length;
    }
    if(document.selection){
        var range = el.createTextRange();
        range.moveEnd('character', -el.value.length);
        range.moveEnd('character', end);
        range.moveStart('character', start);
        range.select();
    }else{
        el.setSelectionRange(start, end);
        el.focus();
    }
};

exports.appendText = function (t, p, paste, isNewLine) {
    var ot = this.getText();
    if (p === undefined) {
        p = this.getCursorPosition() + 1;
    }
    var nt = ot.slice(0, p) + t + ot.slice(p, ot.length);
    this.setText(nt);
    if (paste) {
        if (isNewLine && p) {
            this.select(p+1, p+2);
        } else {
            this.select(p+t.length, p+t.length-1);
        }
    } else {
        this.select(p, p + t.length);
    }
};

exports.insertText = function (t, p, paste, isNewLine) {
    var ot = this.getText();
    if (p === undefined) {
        p = this.getCursorPosition();
    }
    var nt = ot.slice(0, p) + t + ot.slice(p, ot.length);
    this.setText(nt);
    if (paste) {
        if (isNewLine) {
            this.select(p, p+1);
        } else {
            this.select(p+t.length, p+t.length-1);
        }
    } else {
        this.select(p, p + t.length);
    }
};

exports.delete = function (sp, ep) {
    if (sp > ep) {
        var p = ep;
        sp = ep;
        ep = p;
    }
    if (ep - sp > 0) {
        var t = this.getText();
        var nt = t.slice(0, sp) + t.slice(ep);
        if (!nt) {
            nt = ' ';
        }
        this.setText(nt);
        return t.slice(sp, ep);
    }
    return undefined;
};

exports.delSelected = function () {
    var sp = this.getCursorPosition();
    var ep = this.getSelectEndPos();
    return this.delete(sp, ep);
};

exports.getCountFromStartToPosInCurrLine = function(p) {
    if (p === undefined) {
        p = this.getCursorPosition();
    }
    var s = this.getCurrLineStartPos(p);
    return (p - s) + 1;
};

exports.getCurrLineStartPos = function (p) {
    if (p === undefined) {
        p = this.getCursorPosition();
    }
    var sp = this.findSymbolBefore(p, _ENTER_);
    return sp || 0;
};

exports.getCurrLineEndPos = function (p) {
    if (p === undefined) {
        p = this.getCursorPosition();
    }
    if (this.getSymbol(p) == _ENTER_) {
        return p;
    }
    var end = this.findSymbolAfter(p, _ENTER_);
    return end || this.getText().length;
};

exports.getCurrLineCount = function (p) {
    if (p === undefined) {
        p = this.getCursorPosition();
    }
    var left = this.findSymbolBefore(p, _ENTER_);
    var right = this.findSymbolAfter(p, _ENTER_);
    if (left === undefined) {
        return right;
    }
    return right - left;
};

exports.getNextLineStart = function (p) {
    var sp = this.getCurrLineStartPos(p);
    var cc = this.getCurrLineCount(p);
    return sp + cc + 1;
};

exports.getNextLineEnd = function (p) {
    var start = this.getNextLineStart(p);
    if (start !== undefined) {
        var end = this.findSymbolAfter(start, _ENTER_);
        return end || this.getText().length;
    }
    return undefined;
};

exports.getPrevLineEnd = function (pos) {
    var p = this.getCurrLineStartPos(pos);
    if (p > 0) {
        return p - 1;
    }
    return undefined;
};

exports.getPrevLineStart = function (pos) {
   var p = this.getPrevLineEnd(pos);
   if (p !== undefined) {
       var sp = this.findSymbolBefore(p, _ENTER_);
       return sp || 0;
   }
   return undefined;
};

exports.findSymbolBefore = function (p, char) {
    var text = this.getText();
    for (var i = (p-1); i>=0; i--) {
        if (text.charAt(i) == char) {
            return i+1;
        }
    }
    return 0;
};

exports.findSymbolAfter = function (p, char, char2) {
    var text = this.getText();
    var pattern = new RegExp(char);
    //And conditions
    var andPattern = char2 ? new RegExp(char2) : false;
    for (var i = p; i<text.length; i++) {
        if (pattern.test(text.charAt(i))) {
            if (!andPattern) {
                return i;
            } else if (andPattern.test(text.charAt(i))) {
                return i;
            }
        }
    }
    return this.getText().length;
};

exports.getSymbol = function (p) {
    var text = this.getText();
    return text.charAt(p) || undefined;
};

exports.getNextSymbol = function (p) {
    return this.getSymbol(p+1);
};

exports.getPrevSymbol = function (p) {
    return this.getSymbol(p-1);
};

exports.getCurrWordPos = function (p) {
    p = p || this.getCursorPosition();
    //current character
    var char = this.getSymbol(p);

    //parse current character type
    //
    var patternStr;
    if (/[\w\u4e00-\u9fa5]/.test(char) && /[^\|]/.test(char)) {
        //this char is a general character(such as a-z,0-9,_, etc),
        //and should find symbol character(such as *&^%$|{(, etc).
        //
        //pattern string for find symbol char:
        patternStr = "[^\\w\u4e00-\u9fa5]";
    } else if (/\W/.test(char) && /\S/.test(char)) {
        //this char is a symbol character(such as *&^%$, etc),
        //and should find general character(such as a-z,0-9,_, etc).
        //
        //pattern string for find general char:
        patternStr = "[\\w\u4e00-\u9fa5]";
    }

    //parse and get current word`s last character`s right position,
    //and in other word, get the next word`s first character`s left position
    //
    var lastCharPos;
    if (patternStr) {
        //get first invisible character position
        var firstInvisible = this.findSymbolAfter(p, '\\s');
        //get first visible character which after first invisible space
        var firstVisible = this.findSymbolAfter(firstInvisible, '\\S');
        //get position
        lastCharPos = this.findSymbolAfter(p, patternStr, '\\S');
        lastCharPos = lastCharPos - p < firstInvisible - p ? lastCharPos : firstVisible;
    } else {
        //get any visible symbol`s position
        lastCharPos = this.findSymbolAfter(p, '\\S');
    }

    //return current word`s start position and end position
    //
    if (lastCharPos < this.getText().length) {
        return [p, lastCharPos];
    }
    return [p, undefined];
};
