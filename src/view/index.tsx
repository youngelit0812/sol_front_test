import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { rpc, useWalletAddress, util, useAppRoute } from '@sentre/senhub'
import { JupiterProvider } from '@jup-ag/react-hook'
import { Connection, PublicKey } from '@solana/web3.js'

import { Row, Col, Segmented, Alert, Typography } from 'antd'
import SwapChart from './chart'
import Swap from './swap'
import History from './history'

import { useMintSelection } from 'hooks/useMintSelection'
import { AppDispatch, AppState } from 'model'
import { updateBidData } from 'model/bid.controller'
import { updateAskData } from 'model/ask.controller'
import { SenLpState } from 'constant/senLpState'
import { HOMEPAGE_TABS } from 'constant/swap'
import PoolWatcher from 'components/watcher/pool.watcher'
import { usePool } from 'hooks/usePool'
import configs from 'configs'

const {
  sol: { cluster },
} = configs

const connection = new Connection(rpc)

const View = () => {
  const { pools } = usePool()
  const walletAddress = useWalletAddress()
  const dispatch = useDispatch<AppDispatch>()
  const { state } = useLocation<SenLpState>()
  const [bid, setBid] = useState('')
  const [ask, setAsk] = useState('')
  const [tabId, setTabId] = useState(HOMEPAGE_TABS.swap)
  const bidData = useMintSelection(bid)
  const askData = useMintSelection(ask)
  const poolAddress = state?.poolAddress
  const { enhancement } = useSelector((state: AppState) => state.settings)
  const history = useHistory()
  const { to } = useAppRoute()

  /** Check state when user come from sen LP */
  const checkIsSenLpCome = useCallback(() => {
    if (!util.isAddress(poolAddress)) return
    const poolData = pools[poolAddress]
    if (!poolData) return
    setBid(poolData?.mint_a)
    setAsk(poolData?.mint_b)
  }, [poolAddress, pools])

  const onChangeSegmented = useCallback(
    (tabId: string) => {
      setTabId(tabId)
      history.push(`/app/sen_lp?autoInstall=true`)
    },
    [history],
  )

  useEffect(() => {
    checkIsSenLpCome()
  }, [checkIsSenLpCome])

  useEffect(() => {
    if (
      !util.isAddress(bidData.accountAddress) ||
      !util.isAddress(askData.accountAddress)
    )
      return
    dispatch(updateBidData(bidData))
    dispatch(updateAskData(askData))
  }, [askData, bidData, dispatch])

  return (
    <JupiterProvider
      connection={connection}
      cluster={cluster}
      userPublicKey={new PublicKey(walletAddress)}
    >
      <Row
        gutter={[24, 24]}
        style={{ paddingBottom: 12 }}
        justify={enhancement ? 'start' : 'center'}
      >
        <Col xs={24} lg={18}>
          <Alert
            type="info"
            message={
              <Typography.Title level={5}>
                Balansol is launched ✅ Explore Now ✨
              </Typography.Title>
            }
            description={
              <Typography.Text type="secondary">
                Liquidity Provision and Swap are now live on{' '}
                <span style={{ fontWeight: 900 }}>Balansol</span> with index
                funds and custom pool weights.{' '}
                <span style={{ fontWeight: 900 }}>
                  Get your LPs for juicy APR farming - Click here to use
                  Balansol now!
                </span>
              </Typography.Text>
            }
            onClick={() =>
              to('/app/balansol?autoInstall=true', {
                absolutePath: true,
                newWindow: true,
              })
            }
            style={{ cursor: 'pointer' }}
            showIcon
          />
        </Col>
        <Col lg={8} md={12} xs={24}>
          <Row gutter={[24, 24]} justify="center">
            <Col>
              <Segmented
                className="swap-and-pool"
                options={Object.keys(HOMEPAGE_TABS).map((key) => {
                  return { label: key, value: HOMEPAGE_TABS[key] }
                })}
                value={tabId}
                onChange={(val) => onChangeSegmented(val.toString())}
                block
              />
            </Col>
            <Col span={24}>
              <Swap />
            </Col>
          </Row>
        </Col>
        {enhancement && (
          <Col lg={16} md={12} xs={24}>
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <SwapChart />
              </Col>
              <Col span={24}>
                <History />
              </Col>
            </Row>
          </Col>
        )}
      </Row>
      <PoolWatcher />
    </JupiterProvider>
  )
}

export default View
