import {Component, provide, OnInit} from  "angular2/core";

import {default as FormComponent, FORM_DIRECTIVES} from "../common/form.component";
import ChatService from "../../services/chat.socket.service";
import ChatIOModel from "../../../../common/models/io/chat/chat.io.model";
import DivisionSaveIOModel from "../../../../common/models/io/common/division.save.io.model";
import {ChatMessageDataIOModel, ChatAddMessageIOModel} from "../../../../common/models/io/chat/chat.message.io.model";
import Exception from "../../exceptions/exception";

@Component({
    selector: "chat-message-regist",
    directives: [FORM_DIRECTIVES],
    viewProviders: [
        provide(FormComponent, { useExisting: ChatMessageRegistComponent })
    ],
    templateUrl: "scripts/components/chat/chat.message.regist.html",
    inputs: ["chat"]
})
class ChatMessageRegistComponent extends FormComponent implements OnInit {
    private service: ChatService;
    private chat: ChatIOModel;
    private message: string;

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

    private onMessageKeyDown(event: KeyboardEvent) {
        if (event.keyCode == 13
            && event.ctrlKey) {
            // Ctrl + Enter
            if (this.message) {
                this.addMessage();
            }
            return false;
        }
        return true;
    }

    private addMessage() {
        this.clearError();
        this.submit(() => {
            this.service.addMessage(new ChatAddMessageIOModel(
                {
                    _id: this.chat._id,
                    message: new ChatMessageDataIOModel(
                        {
                            data: this.message,
                            type: new DivisionSaveIOModel(
                                {
                                    subcode: this.division.SubCode.MessageType.TEXT
                                })
                        }
                    )
                }
            ));
            this.message = null;
        });
    }

    private onDrop(event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();

        this.clearError();

        const exec = (file: any) => {
            const reader = new FileReader();
            reader.onload = (data: any) => {
                let type: string;
                if (file.type.match(/image.*/)) {
                    type = this.division.SubCode.MessageType.IMAGE;
                } else if (file.type.match(/video.*/)) {
                    type = this.division.SubCode.MessageType.VIDEO;
                } else {
                    type = this.division.SubCode.MessageType.FILE;
                }

                this.service.addMessage(new ChatAddMessageIOModel(
                    {
                        _id: this.chat._id,
                        message: new ChatMessageDataIOModel(
                            {
                                data: data.target.result,
                                type: new DivisionSaveIOModel(
                                    {
                                        subcode: type
                                    }),
                                title: file.name
                            }
                        )
                    }
                ));
            };
            reader.readAsDataURL(file);
        };

        const files = event.dataTransfer.files;
        for (let i = 0; i < files.length; i++)
            exec(files[i]);
    }

    private onFailure(error: Exception) {
        this.addError(error.errors);
    }

    public get hasError(): boolean {
        return super.hasError;
    }
}

export default ChatMessageRegistComponent;
