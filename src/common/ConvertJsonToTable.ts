import { Parser } from "json2csv";
import * as XLSX from 'xlsx';


export class ConvertJsonToTable {
    constructor() { }

    async convertToTable(json: any[], format:String = 'xls'){
        switch (format) {
            case 'xls':
                var worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
                var workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
                var excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
                return excelBuffer
                break;
            case 'xlsx':
                var worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
                var workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
                var excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
                return excelBuffer
                break;
            case 'csv':
                const parser =  new Parser();
                const csv = parser.parse(json);
                return csv
                break
            default:
                break;
        }
    }
}