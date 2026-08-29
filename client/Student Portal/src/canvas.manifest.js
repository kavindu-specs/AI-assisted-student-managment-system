export const manifest = {
  screens: {
    scr_vlbvup: { name: "Student Login", route: "/", position: { "x": 160, "y": 220 } },
    scr_vzc4d5: { name: "Student Dashboard", route: "/dashboard", position: { "x": 176.85, "y": 2006.03 } },
    scr_qdabyu: { name: "My Profile — Personal Details", route: "/profile", position: { "x": 160, "y": 3986.03 } },
    scr_vhhu8k: { name: "My Profile — Family Information", route: "/profile/family", position: { "x": 1560, "y": 3986.03 } },
    scr_uipi1h: { name: "My Profile — Emergency Contact", route: "/profile/emergency-contact", position: { "x": 2960, "y": 3986.03 } },
    scr_up71hs: { name: "My Profile — Upload Documents", route: "/profile/upload-documents", position: { "x": 4360, "y": 3986.03 } },
    scr_xvfyda: { name: "My Profile — Review & Submit", route: "/profile/review", position: { "x": 5760, "y": 3986.03 } },
    scr_71rbvw: { name: "Registration Status", route: "/registration-status", position: { "x": 160, "y": 5966.03 } },
    scr_e32mgx: { name: "Course Registration", route: "/course-registration", position: { "x": 1560, "y": 5966.03 } },
    scr_6odu1s: { name: "Registration Confirmation", route: "/registration-confirmation", position: { "x": 2960, "y": 5966.03 } }
  },
  sections: {
    sec_sj3ew5: { name: "Onboarding", x: 0, y: 0, width: 1520, height: 1180 },
    sec_xdbb6j: { name: "Dashboard", x: 16.85, y: 1786.03, width: 1520, height: 1180 },
    sec_65sh5d: { name: "User Profile", x: 0, y: 3766.03, width: 7120, height: 1180 },
    sec_ikaehs: { name: "Registration Status", x: 0, y: 5746.03, width: 4320, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_sj3ew5", children: [
    { kind: "screen", id: "scr_vlbvup" }]
  },
  { kind: "section", id: "sec_xdbb6j", children: [
    { kind: "screen", id: "scr_vzc4d5" }]
  },
  { kind: "section", id: "sec_65sh5d", children: [
    { kind: "screen", id: "scr_qdabyu" },
    { kind: "screen", id: "scr_vhhu8k" },
    { kind: "screen", id: "scr_uipi1h" },
    { kind: "screen", id: "scr_up71hs" },
    { kind: "screen", id: "scr_xvfyda" }]
  },
  { kind: "section", id: "sec_ikaehs", children: [
    { kind: "screen", id: "scr_71rbvw" },
    { kind: "screen", id: "scr_e32mgx" },
    { kind: "screen", id: "scr_6odu1s" }]
  }]

};