import { District } from "./district";
import i18n from "./i18n";

const section = ui.createProjectPanelSection();
section.add(new ui.Paragraph(i18n.Move_around_to_select()));

export const districts: District[] = [];

let activeDistrict;
let districtSection;
let marker;
let centerChangeSubscription;


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

section.onOpen.subscribe(() => {
  const initialDistrict = new District(map.location.center);
  activeDistrict = initialDistrict;
  districtSection = activeDistrict.render();
  districts.push(initialDistrict);
  activeDistrict.update();

  marker = new map.Marker(map.location.center.flattenedCopy(), Color.black);
  marker.overlayBuildings = true;

  centerChangeSubscription = map.location.onCenterChange.subscribe((position) => {
    console.log("Map center changed: " + position.toString());
    if (activeDistrict) {
      if (marker) {
        marker.move(position.flattenedCopy());
      }
      let district = districts.find((district) => district.isInside(position));

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
    }
  });

});

section.onClose.subscribe(() => {
  if (marker) {
    marker.remove();
  }
  section.remove(districtSection);
  districts.forEach((district) => district.area.remove());
  districts.length = 0;
  activeDistrict = null;

  if (centerChangeSubscription) {
    centerChangeSubscription.unsubscribe();
  }
});
