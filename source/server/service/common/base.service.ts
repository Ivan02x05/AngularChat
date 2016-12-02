import {Container} from "../../common/container/container";
import ServideResult from "./service.result";

abstract class BaseService {
    protected get result(): ServideResult {
        return this.getComponent(ServideResult);
    }

    protected getComponent<T>(clazz: { new (...args: any[]): T }): T {
        return Container.resolve(clazz, this);
    }

    protected static getComponent<T>(clazz: { new (...args: any[]): T }): T {
        return <T>Container.resolve(clazz);
    }
}

export default BaseService;
