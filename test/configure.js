import chai from 'chai'
import chaiSubset from 'chai-subset'
chai.use(chaiSubset)
import { before } from 'mocha'
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
configure({ adapter: new Adapter() })

/* eslint-env node */

if (process.argv.indexOf('--watch') >= 0) {
  before(() => process.stdout.write('\u001b[2J\u001b[1;1H\u001b[3J'))
}
