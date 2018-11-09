/* global describe, it, before */

import chai from 'chai'
import axios from 'axios'
import Gymote from '../lib/gymote.js'

chai.expect()

const expect = chai.expect

let lib

describe('Given an instance of my Gymote library', () => {
  before(() => {
    lib = new Gymote('http://localhost:3000', axios)
  })
  describe('when I need the connection status', () => {
    it('should return the connection status', () => {
      expect(lib.isConnected()).to.be.equal(false)
    })
  })
})
