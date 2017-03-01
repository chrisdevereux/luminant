import { expect } from 'chai'
import * as cheerio from 'cheerio'

import { Testcase } from './utils/testcase';

describe('development server', () => {
  const site = Testcase.createDevServer({
    luminantConfig: {
      paths: ['test/sites/basic-site/*.tsx'],
      debug: true,
    }
  })

  siteExamples(site)

  it('should not ssr', async () => {
    const r = await site.fetch('/')
    const $ = cheerio.load(await r.text())
    expect($('#app')).to.be.empty
  })
})

describe('production server', () => {
  const site = Testcase.createProdServer({
    luminantConfig: {
      paths: ['test/sites/basic-site/*.tsx'],
      debug: false,
    }
  })

  siteExamples(site)

  it('should ssr', async () => {
    const r = await site.fetch('/')
    const $ = cheerio.load(await r.text())
    expect($('#app').text()).to.eql('Hello, world!')
  })
})

function siteExamples(site: Testcase) {
  it('should serve page', async () => {
    const r = await site.fetch('/')
    expect(r.status).to.eql(200)
    expect(r.headers.get('Content-Type')).to.match(/text\/html/)
  })

  it('should serve js bundle', async () => {
    const r = await site.fetch('/bundle.js')
    expect(r.status).to.eql(200)
    expect(r.headers.get('Content-Type')).to.match(/application\/javascript/)
  })

  it('should render on client', async () => {
    const browser = await site.visit('/')
    await browser.assertText('#app', 'Hello, world!')
  })
}
