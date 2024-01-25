import { District } from "./district";
import i18n from './i18n';

const section = ui.createProjectPanelSection();
section.add(new ui.Paragraph(i18n.Move_around_to_select()));

const initialDistrict = new District(map.location.center);

export const districts: District[] = [initialDistrict];

export let activeDistrict = initialDistrict;
activeDistrict.update();

let districtSection = initialDistrict.render();
section.add(districtSection);

const marker = new map.Marker(map.location.center.flattenedCopy(), Color.black);
marker.overlayBuildings = true;

const log = new ui.Container();
section.add(log);

const clearLogButton = new ui.Button(i18n.Clear_Log(), () => {
    for (let child of log.children.slice(1)) {
        log.remove(child);
    }
});

log.add(clearLogButton);

export const createLog = message => {
    log.insertAfter(new ui.Note(ui.info, message), clearLogButton);
};

map.location.onCenterChange.subscribe(position => {
    marker.move(position.flattenedCopy());

    let district = districts.find(district => district.isInside(position));

    if (!district) {
        district = new District(position);

        districts.push(district);
    }

    if (district != activeDistrict) {
        const deactivatedDistrict = activeDistrict;
        activeDistrict = district;

        deactivatedDistrict.update();
        district.update();

        section.remove(districtSection);

        districtSection = district.render();
        section.insertBefore(districtSection, log);
    }
});