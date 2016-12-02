import {Container} from "../../common/container/container";
import DataBase from "../../database/database";
import {inject} from "../../common/container/inject.decorator";

@inject([{ clazz: DataBase }])
class BaseBusiness {
    protected database: DataBase;

    constructor(database?: DataBase) {
        this.database = database;
    }

    protected getComponent<T>(clazz: { new (...args: any[]): T }): T {
        return Container.resolve(clazz, this);
    }

    protected static getComponent<T>(clazz: { new (...args: any[]): T }): T {
        return <T>Container.resolve(clazz);
    }
}

export default BaseBusiness;
