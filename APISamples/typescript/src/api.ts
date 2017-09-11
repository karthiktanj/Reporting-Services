import { CatalogItem } from './api';
export class Api {
    private serverUrl:string;

    constructor(server:string = 'http://localhost/reports'){
        this.serverUrl = `${server}/api/v2.0`
    }

    requestOptions(method:string, body?:any): RequestInit {
        return {
            credentials: 'include',
            mode: 'cors',
            headers: {
                'Content-Type':'application/json;charset=UTF-8'
            },
            method,
            body: JSON.stringify(body)
        }
    }

    async getFolderItemsAsync(path:string = '/') : Promise<CatalogItem[] | CatalogItem> {
        let url: string = `${this.serverUrl}/Folders(Path='${path}')/CatalogItems`;
        let response = await fetch(url, this.requestOptions('GET'));
        let items = await response.json();
        return items.value;
    }

    async postCatalogItemAsync(item:CatalogItem) : Promise<void> {
        let url: string = `${this.serverUrl}/CatalogItems`;
        let response = await fetch(url, this.requestOptions('POST',item));
        let createdItem = await response.json();
        return createdItem;
    }

    async meAsync() : Promise<User> {
        let url: string = `${this.serverUrl}/me`;
        let response = await fetch(url, this.requestOptions('GET'));
        let item = await response.json();
        return item;
    }

    async uploadFileAsync(file: File) : Promise<void> {
        let fileInfo = await this.getFileInfo(file);
        let path = window.location.hash.substring(1);
        path = path.length > 1 ? path : '';
        let item:any = {
            Content: fileInfo.content,
            Path: `${path}/${fileInfo.name}`,
            Name: fileInfo.name,
            ContentType: fileInfo.contentType
        }

        switch (fileInfo.extension.toLocaleLowerCase()) {
            case 'rdl':
                item['@odata.type'] = '#Model.Report';
                break;
            case 'rsd':
                item['@odata.type'] = '#Model.DataSet';
                break;
            case 'rds':
                item.ContentType = 'text/xml';
                item['@odata.type'] = '#Model.Resource';
                break;
            case 'rsc':
                item['@odata.type'] = '#Model.Component';
                break;
            case 'smdl':
                item['@odata.type'] = '#Model.ReportModel';
                break;
            case 'rsmobile':
                item['@odata.type'] = '#Model.MobileReport';
                break;
            case 'pbix':
                item['@odata.type'] = '#Model.PowerBIReport';
                break;
            case 'xls':
            case 'xlsb':
            case 'xlsm':
            case 'xlsx':
            case 'csv':
                item['@odata.type'] = '#Model.ExcelWorkbook';
                break;
            default:
                item['@odata.type'] = '#Model.Resource';
                break;
        }

        return api.postCatalogItemAsync(item);
    }

    private getFileInfo(file:File): Promise<IFileInfo> {
        let p = new Promise<IFileInfo>((res, rej) => {
            let reader = new FileReader();
            let fileInfo:any = {
                name:file.name,
                extension: file.name.substring(file.name.lastIndexOf('.')+1),
                size: file.size
            }
            reader.onload = (metadata) => {
                fileInfo.content = reader.result.substring(reader.result.indexOf(',')+1);
                fileInfo.contentType = reader.result.replace(/data:(.*);.*/,'$1');
                res(fileInfo);
            }

            reader.readAsDataURL(file);
        })

        return p;
    }
}

export const api = new Api('http://10.130.60.160/reports');


export enum CatalogItemType { 
    Unknown = "Unknown",
    Folder = "Folder",
    Report = "Report",
    DataSource = "DataSource",
    DataSet = "DataSet",
    Component = "Component",
    Resource = "Resource",
    Kpi = "Kpi",
    MobileReport = "MobileReport",
    LinkedReport = "LinkedReport",
    ReportModel = "ReportModel",
    PowerBIReport = "PowerBIReport",
    ExcelWorkbook = "ExcelWorkbook"
}

export interface CatalogItem {
    Id?: string;
    Name?: string;
    Description?: string;
    Path?: string;
    Type: CatalogItemType;
    Hidden?: boolean;
    Size?: number;
    ModifiedBy?: string;
    ModifiedDate?: Date;
    CreatedBy?: string;
    CreatedDate?: Date;
    ParentFolderId?: string;
    ContentType?: string;
    Content?: string;
    IsFavorite?: boolean;
}

export interface User {
    Id?: string;
    Username?: string;
    DisplayName?: string;
    HasFavoriteItems?: boolean;
    MyReportsPath?: string;
}

interface IFileInfo {
    name: string;
    extension: string;
    content: string;
    contentType: string;
    size: number;
}