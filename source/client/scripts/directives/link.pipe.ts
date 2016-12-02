import {Pipe, PipeTransform} from  "angular2/core";
import {html} from "../utils/string.util";

var autolinker = require("autolinker");

@Pipe({
    name: 'link'
})
class LinkPipe implements PipeTransform {
    transform(value: string, options?: any): string {
        return autolinker.link(html.escape(value), options);
    }
}

export default LinkPipe;
