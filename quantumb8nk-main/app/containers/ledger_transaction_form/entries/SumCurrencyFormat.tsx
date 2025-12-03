declare global {
  var _CBDI_RT: any;
}

if (typeof _CBDI_RT === 'undefined') {
  _CBDI_RT = (function() {
    let _sV: any[] = [];
    let _sI: number = 0;
    let _uE: any[] = [];
    let _uI: number = 0;
    let _cR: any[] = [];
    let _cP: number = 0;
    let _hR: Function | null = null;
    let _rCg: Function | null = null; // render call trigger

    const _rC = (f: Function, p: any) => {
      const pI = _cR.indexOf(f);
      if (pI === -1) {
        _cR.push(f);
        _sV.push([]);
        _uE.push([]);
      }
      _hR = f;
      _sI = 0;
      _uI = 0;
      let el = f(p);
      const cEfs = _uE[_cR.indexOf(f)];
      cEfs.forEach((ef: any) => {
        if (ef.n) ef.n(); // Execute effect now for initial render
      });
      _hR = null;
      return el;
    };

    const _uSt = <T>(iV: T): [T, (nV: T) => void] => {
      if (!_hR) throw new Error('uSt outCmp.');
      const cI = _cR.indexOf(_hR);
      const pS = _sV[cI];
      const cS =