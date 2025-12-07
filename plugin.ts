import { District } from "./district";
import i18n from "./i18n";

const section = ui.createProjectPanelSection();
section.add(new ui.Paragraph(i18n.Move_around_to_select()));

export const districts: District[] = [];

export let activeDistrict; // = initialDistrict;
let districtSection;
let marker;

const log = new ui.Container();
section.add(log);

const clearLogButton = new ui.Button(i18n.Clear_Log(), () => {
  for (let child of log.children.slice(1)) {
    log.remove(child);
  }
});

log.add(clearLogButton);

export const createLog = (message) => {
  log.insertAfter(new ui.Note(ui.info, message), clearLogButton);
};
let subscription;
section.onOpen.subscribe(() => {
  marker = new map.Marker(map.location.center.flattenedCopy(), Color.black);
  marker.overlayBuildings = true;

  const initialDistrict = new District(map.location.center);
  districts.push(initialDistrict);
  activeDistrict = initialDistrict;
  districtSection = initialDistrict.render();
  section.add(districtSection);

  subscription = map.location.onCenterChange.subscribe((position) => {
    if (marker) {
      marker.move(position.flattenedCopy());
    }
    let district = districts.find((district) => district.isInside(position));

    if (!district) {
      district = new District(position);

      districts.push(district);
    }

    if (district.id != activeDistrict.id) {
      activeDistrict = district;

      district.update();

      section.remove(districtSection);

      districtSection = district.render();
      section.insertBefore(districtSection, log);
    }
  });
});

section.onClose.subscribe(() => {
  districts.forEach((district) => district.area?.remove());
  section.remove(districtSection);
  marker.remove();
  subscription.unsubscribe();
});
