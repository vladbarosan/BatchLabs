import { ModuleWithProviders, NgModule } from "@angular/core";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { routes } from "app/app.routes";

import {
    BoolPropertyComponent,
    LinkPropertyComponent,
    PropertyGroupComponent,
    PropertyListComponent,
    VoidLinkPropertyComponent,
} from "./property-list.component";

import {
    TablePropertyComponent, TablePropertyHeaderComponent, TablePropertyRowComponent,
} from "./table-property.component";
import { TextPropertyComponent } from "./text-property.component";

const components = [
    BoolPropertyComponent,
    LinkPropertyComponent,
    PropertyListComponent,
    PropertyGroupComponent,
    TextPropertyComponent,
    VoidLinkPropertyComponent,
    TablePropertyComponent,
    TablePropertyHeaderComponent,
    TablePropertyRowComponent,
];

@NgModule({
    declarations: components,
    entryComponents: [],
    exports: [...components],
    imports: [BrowserModule, MaterialModule, RouterModule.forRoot(routes, { useHash: true })],
    providers: [],
})

export class PropertyListModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: PropertyListModule,
            providers: [],
        };
    }
}
