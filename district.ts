import { createLog } from "./plugin";
import i18n from './i18n';
export class District {
    static size = 0.005;

    id: string;
    position: GlobalPosition;

    area: map.ColoredArea;

    constructor(position: GlobalPosition) {
        this.position = new GlobalPosition(
            Math.floor(position.latitude * (1 / District.size)) / (1 / District.size),
            Math.floor(position.longitude * (1 / District.size)) / (1 / District.size),
        );

        this.id = `${Math.floor(position.latitude * (1 / District.size))}#${Math.floor(position.longitude * (1 / District.size))}`,

        this.update();
    }

    get bounds() {
        return [
            this.position.copy(0, 0),
            this.position.copy(District.size, 0),
            this.position.copy(District.size, District.size),
            this.position.copy(0, District.size)
        ];
    }

    isInside(position: GlobalPosition) {
        return position.latitude >= this.position.latitude 
            && position.latitude <= this.position.latitude + District.size 
            && position.longitude >= this.position.longitude 
            && position.longitude <= this.position.longitude + District.size
    }

    update() {
        marketplace.restore('ecological-report', this.id).then(token => {
            this.area?.remove();

            this.area = new map.ColoredArea([...this.bounds, this.position], (token ? Color.green : Color.red).copy(0.25), Color.white);
        });
    }

    render() {
        const section = new ui.Section(i18n.District_Title({id: this.id}));
        section.add(new ui.Paragraph(i18n.Nature_Report_Info()));
    
        marketplace.restore('ecological-report', this.id).then(token => {
            createLog(i18n.Restore_Log()({id: this.id, token}));
    
            if (token) {
                section.add(new ui.LinkButton(i18n.Download_Report_Luucy(), `https://www.luucy.ch/`));
            } else {
                const buyButton = new ui.Button(i18n.Buy_Report(), async () => {
                    createLog(i18n.Requesting_Purchase());
    
                    const token = await marketplace.purchase('ecological-report', this.id);
    
                    createLog(i18n.Purchase_Response()({token}));
    
                    if (token) {
                        section.add(new ui.LinkButton(i18n.Download_Report(), `https://mock.acryps.com/report/${this.id}`));
    
                        section.remove(buyButton);
                    }
    
                    this.update();
                });
    
                section.add(buyButton);
            }
        })
    
        return section;
    }
}