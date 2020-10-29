export interface MenuItem {
  url: string;
  label: string;
  style: string;
  clickAction?: Function;
  cssIcon: string;
  intermediateBtn?: boolean;
  children?: {label: string, url: string }[];
}
