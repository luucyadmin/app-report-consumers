import { activeDistrict, districts } from "./plugin";

export class District {
    static size = 0.01;

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
        this.area?.remove();

        if (activeDistrict == this) {
            this.area = new map.ColoredArea([...this.bounds, this.position], Color.yellow.copy(0.5), Color.yellow);
        } else {
            this.area = new map.ColoredArea([...this.bounds, this.position], Color.white.copy(0.25), Color.white);
        }
    }

    render() {
        const section = new ui.Section(`District ${this.id}`);
        section.add(new ui.Paragraph('Get a nature report about this district to learn more about the environment influences and data'));

        marketplace.restore('ecological-report', this.id).then(token => {
            if (token) {
                section.add(new ui.LinkButton('Download Report', `https://mock.acryps.com/report/${this.id}`))
            } else {
                const buyButton = new ui.Button('Buy Report', async () => {
                    const token = await marketplace.purchase('ecological-report', this.id);

                    if (token) {
                        section.add(new ui.LinkButton('Download Report', `https://mock.acryps.com/report/${this.id}`));

                        section.remove(buyButton);
                    }
                });

                section.add(buyButton);
            }
        })

        return section;
    }
}