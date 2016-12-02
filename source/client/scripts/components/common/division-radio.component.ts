import {Component, OnInit, provide, forwardRef, Input} from  "angular2/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from  "angular2/common";

import DivisionManerger from "../../manergers/division.manerger";
import DivisionModel from "../../../../common/models/impl/common/division.model";
import DivisionSaveModel from "../../../../common/models/impl/common/division.save.model";

const noop = () => { };
const VALUE_ACCESSOR = provide(NG_VALUE_ACCESSOR, {
    useExisting: forwardRef(() => DivisionRadioComponent),
    multi: true
});

@Component({
    selector: "division-radio",
    providers: [VALUE_ACCESSOR],
    templateUrl: "scripts/components/common/division-radio.html"
})
class DivisionRadioComponent implements OnInit, ControlValueAccessor {
    private manerger: DivisionManerger;
    private divisions: DivisionModel[];

    @Input() code: string;

    private _value: DivisionSaveModel;
    private name: string;
    private _onTouchedCallback: (_?: any) => void = noop;
    private _onChangeCallback: (_: any) => void = noop;

    constructor(manerger: DivisionManerger) {
        this.manerger = manerger;
    }

    public ngOnInit() {
        this.divisions = this.manerger
            .getDivisions(this.code);
        this.name = this.code + "_" + Math.random().toString();
    }

    public get value(): DivisionSaveModel {
        return this._value;
    }

    public set value(value: DivisionSaveModel) {
        if (this._value != value) {
            this._value = value;
            this._onChangeCallback(value);
        }
    }

    public writeValue(value: any) {
        this.value = value;
    }

    public registerOnChange(fn: any) {
        this._onChangeCallback = fn;
    }

    public registerOnTouched(fn: any) {
        this._onTouchedCallback = fn;
    }

    private onChange(target: DivisionModel) {
        this.value = new DivisionSaveModel(target);
    }

    private onTouched() {
        this._onTouchedCallback();
    }
}

export default DivisionRadioComponent;
