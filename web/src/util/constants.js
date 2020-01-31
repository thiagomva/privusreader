import { AppConfig } from 'blockstack'

export const appConfig = new AppConfig(['store_write'])
export const server_api = process.env.REACT_APP_SERVER_API
export const menuLimitForMobile = 992