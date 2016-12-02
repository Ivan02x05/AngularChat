import {Component, provide, OnInit, OnDestroy, Directive, Input} from  "angular2/core";
import {NG_VALIDATORS, AbstractControl} from "angular2/common";

import {default as FormComponent, FORM_DIRECTIVES} from "../common/form.component";
import ChatService from "../../services/chat.socket.service";
import ChatModel from "../../../../common/models/impl/chat/chat.model";
import UserModel from "../../../../common/models/impl/common/user.model";
import Exception from "../../exceptions/exception";
import {ValidatorBase, ErrorConstant} from "../../validators/validator.common";
import UserManerger from "../../manergers/user.manerger";

@Directive({
    selector: '[permission-validator]',
    providers: [provide(NG_VALIDATORS, { useExisting: PermissionValidator, multi: true })],
    inputs: ["condition:permission-validator"]
})
class PermissionValidator extends ValidatorBase {
    private condition: boolean;
    private user: UserModel;

    constructor(manerger: UserManerger) {
        super();

        this.user = manerger.user;
    }

    public validateControl(control: AbstractControl) {
        if (this.condition
            && !this.user.isAdmin
            && control.value != null
            && control.value.filter(_ => _._id == this.user._id).length == 0)
            this.add(ErrorConstant.Code.Error.CANT_FOR, "編集者が閲覧", "権限");
    }
}

@Component({
    selector: "chat-edit",
    directives: [FORM_DIRECTIVES, PermissionValidator],
    viewProviders: [
        provide(FormComponent, { useExisting: ChatEditComponent })
    ],
    templateUrl: "scripts/components/chat/chat.edit.html",
    inputs: ["model"]
})
class ChatEditComponent extends FormComponent implements OnInit, OnDestroy {
    private service: ChatService;

    private cache: ChatModel;
    private _model: ChatModel = new ChatModel();
    private set model(model: ChatModel) {
        this._model = new ChatModel(model);
        this.cache = model;
        this.editable = model == null;
    }
    private get model(): ChatModel {
        return this._model;
    }

    private editable: boolean = true;
    private chatEvents = [];

    constructor(service: ChatService) {
        super();

        this.service = service;
    }

    public ngOnInit() {
        this.initService();
    }

    public ngOnDestroy() {
        this.chatEvents.forEach(_ => {
            this.service.off(_);
        });
    }

    private initService() {
        this.chatEvents.push(this.onFailure.bind(this));
        this.service.onFailure = this.chatEvents[0];
    }

    private edit() {
        this.editable = true;
    }

    private cancel() {
        this.clearError();
        this.model = new ChatModel(this.cache);
        this.editable = false;
    }

    private regist() {
        this.submit(() => {
            this.service.regist(this.model);
        });
    }

    private update() {
        this.clearError();
        this.submit(() => {
            this.service.update(this.model);
        });
    }

    private delete() {
        this.clearError();
        this.service.delete(this.cache);
    }

    private get updatable(): boolean {
        return this.cache != null;
    }

    private get authoritative(): boolean {
        return this.model.canUpdate(this.user);
    }

    private onPermissionChange() {
        this.form.controls["users"].updateValueAndValidity();
    }

    private onFailure(error: Exception) {
        this.addError(error.errors);
    }
}

export default ChatEditComponent;
