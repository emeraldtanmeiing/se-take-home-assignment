import { useState, useEffect, useRef } from "react";
import { isEmpty } from "lodash";
import { useInterval } from "./useInterval.js";

function App() {
  const [pending, setPending] = useState([]);
  const nextOrder = useRef({});
  const [complete, setComplete] = useState([]);
  const [orderNo, setOrderNo] = useState(1);

  const [bots, setBots] = useState([]);
  const [botNo, setBotNo] = useState(1);

  useEffect(()=>{
    nextOrder.current = pending[0]
  }, [pending])

  const sortOrders = (orders) => {
    orders.sort((a, b) => {
      return a.priority > b.priority
        ? 1
        : a.priority < b.priority
        ? -1
        : a.orderNo > b.orderNo
        ? 1
        : -1;
    });
  };

  const addOrder = (priority) => {
    setPending((prev) => {
      const newOrder = { orderNo: orderNo, priority: priority };
      let temp = [...prev, newOrder];
      sortOrders(temp);
      return temp;
    });
    setOrderNo(orderNo + 1);
  };

  const addBackOrder = (order) => {
    setPending((prev) => {
      let temp = [...prev, order];
      sortOrders(temp);
      return temp;
    });
  };

  const getNextOrder = () => {
    return nextOrder.current;
  };

  const completeOrder = (order) => {
    setComplete((prevComplete) => [...prevComplete, order]);
  };

  const assignOrder = (bot, order) => {
    setPending((prevPending) =>
      [...prevPending].filter((i) => i.orderNo != order.orderNo)
    );
    bot.currentOrder = {
      ...order,
      timeLeft: 10,
    };
    updateBot(bot);
  };

  const addBot = () => {
    const newBot = { botNo: botNo, currentOrder: null };
    setBots((bots) => [...bots, newBot]);
    setBotNo(botNo + 1);
  };

  const updateBot = (bot) => {
    setBots((bots) => {
      let temp = [...bots];
      temp = temp.map((i) => {
        return i.botNo == bot.botNo ? bot : i;
      });
      return temp;
    });
  };

  useInterval(() => {
    bots.forEach((bot) => {
      setTimeout(() => {
        //if bot has no order
        if (isEmpty(bot.currentOrder)) {
          if (!isEmpty(getNextOrder())) {
            //assign order & update pending
            let order = getNextOrder();
            assignOrder(bot, order);
          }
        } else {
          //if bot has order
          if (bot.currentOrder.timeLeft > 0) {
            bot.currentOrder.timeLeft = bot.currentOrder.timeLeft - 1;
            updateBot(bot);
          } else {
            //complete order
            const completedOrder = bot.currentOrder;
            completeOrder(completedOrder);
            bot.currentOrder = null;
            updateBot(bot);
          }
        }
      }, bot.botNo * 10);
    });
  }, 1000);

  const removeLatestBot = () => {
    setBots((prevBots) => {
      const temp = [...prevBots];
      const latestBot = temp.pop();
      if (!isEmpty(latestBot.currentOrder)) {
        addBackOrder(latestBot.currentOrder);
      }
      return temp;
    });
    setBotNo(botNo - 1);
  };

  return (
    <div>
      <button onClick={() => addOrder(1)}>New Normal Order</button>
      <br />
      <button onClick={() => addOrder(0)}>New VIP Order</button>

      <br />
      <br />

      <button onClick={() => addBot()}>+ Bot</button>
      <br />
      <button onClick={() => removeLatestBot()}>- Bot</button>

      <br />
      <br />

      <div className="pending">
        PENDING
        {pending.map((i) => {
          return (
            <div key={i.orderNo}>
              Order {i.orderNo} ({i.priority == 0 ? "VIP" : "Normal"})
            </div>
          );
        })}
      </div>

      <br />

      <div className="complete">
        COMPLETE
        {complete.map((i) => {
          return (
            <div key={i.orderNo}>
              Order {i.orderNo} ({i.priority == 0 ? "VIP" : "Normal"})
            </div>
          );
        })}
      </div>

      <br />

      <div className="bot">
        BOT
        {bots.map((i) => {
          return (
            <div key={i.botNo}>
              Bot No: {i.botNo}
              {", "}
              {i.currentOrder
                ? `Processing Order ${i.currentOrder.orderNo}, ${i.currentOrder.timeLeft} seconds left...`
                : "Idle"}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
